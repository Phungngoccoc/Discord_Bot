const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');
const loadVietnameseWords = require('../../../utils/loadVietnameseWords');
const { getWordSet } = require('../../../utils/loadVietnameseWords');

let gameState = {}; // Lưu trạng thái game theo channel

function isValidWord(word) {
    const validWords = getWordSet();
    return validWords.has(word.toLowerCase());
}

function getLastSyllable(word) {
    const parts = word.trim().split(/\s+/);
    return parts[parts.length - 1];
}

function getFirstSyllable(word) {
    return word.trim().split(/\s+/)[0];
}

function isNextValid(prev, current) {
    if (!prev || !current) return false;
    const last = getLastSyllable(prev).normalize('NFC');
    const first = getFirstSyllable(current).normalize('NFC');
    return last === first;
}

function hasNextWord(word, usedWords) {
    const validWords = getWordSet();
    const last = getLastSyllable(word).normalize('NFC');
    return Array.from(validWords).some(w => {
        const first = getFirstSyllable(w).normalize('NFC');
        return first === last && !usedWords.has(w);
    });
}

function isEligibleWord(word) {
    const parts = word.trim().split(/\s+/);
    if (parts.length !== 2) return false;
    const validPattern = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểẾỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸỳỵỷỹ\s]+$/;
    return validPattern.test(word);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Bắt đầu game nối từ trong kênh đã thiết lập'),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const channelId = interaction.channel.id;

        const config = await GuildConfig.findOne({ guildId });
        if (!config || config.wordGameChannelId !== channelId) {
            return interaction.reply({ content: 'Kênh này không phải kênh chơi game nối từ đã được thiết lập!', flags: 64 });
        }

        gameState[channelId] = {
            currentWord: null,
            started: true,
            usedWords: new Set()
        };

        await interaction.reply('Trò chơi nối từ đã bắt đầu! Hãy nhập từ đầu tiên.');
    },

    async onMessage(message) {
        const channelId = message.channel.id;
        const state = gameState[channelId];

        if (!state || !state.started || message.author.bot) return;

        const word = message.content.trim().toLowerCase();
        if (!isEligibleWord(word)) return;

        if (state.usedWords.has(word)) return message.react('❌');
        if (!isValidWord(word)) return message.react('❌');

        if (state.currentWord === null) {
            if (!hasNextWord(word, state.usedWords)) {
                state.started = false;
                await message.react('❌');
                return message.channel.send(`Không thể nối tiếp. Trò chơi kết thúc.`);
            }

            state.currentWord = word;
            state.usedWords.add(word);
            return message.react('✅');
        }

        if (isNextValid(state.currentWord, word)) {
            const canContinue = hasNextWord(word, state.usedWords);
            state.currentWord = word;
            state.usedWords.add(word);
            await message.react('✅');

            if (!canContinue) {
                state.started = false;
                return message.channel.send(`Bạn đã nói từ cuối cùng có thể nối được: **${word}**. Trò chơi kết thúc.`);
            }
        } else {
            await message.react('❌');
        }
    }
};