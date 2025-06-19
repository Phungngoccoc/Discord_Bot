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

    // Kiểm tra đúng 2 âm tiết
    if (parts.length !== 2) return false;

    // Kiểm tra ký tự đặc biệt hoặc số
    const validPattern = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểẾỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸỳỵỷỹ\s]+$/;
    return validPattern.test(word);
}

module.exports = {
    name: 'start',
    description: 'Bắt đầu game nối từ',

    execute: async (message) => {
        const guildId = message.guild.id;
        const channelId = message.channel.id;

        const config = await GuildConfig.findOne({ guildId });
        if (!config || config.wordGameChannelId !== channelId) return;

        gameState[channelId] = {
            currentWord: null,
            started: true,
            usedWords: new Set()
        };

        message.channel.send('Trò chơi nối từ đã bắt đầu! Hãy nhập từ đầu tiên.');
    },

    async onMessage(message) {
        const channelId = message.channel.id;
        const state = gameState[channelId];

        if (!state || !state.started || message.author.bot) return;

        const word = message.content.trim().toLowerCase();
        console.log(`[Nối Từ] Word received: "${word}"`);

        if (!isEligibleWord(word)) {
            console.log(`[Nối Từ] Bỏ qua từ không đủ 2 âm tiết: "${word}"`);
            return;
        }

        if (state.usedWords.has(word)) {
            console.log(`[Nối Từ] Từ đã được sử dụng trước đó: ${word}`);
            return await message.react('❌');
        }

        const isValid = isValidWord(word);
        console.log(`[Nối Từ] isValidWord: ${isValid}`);

        if (!isValid) {
            console.log(`[Nối Từ] Từ không hợp lệ: ${word}`);
            return await message.react('❌');
        }

        if (state.currentWord === null) {
            const canContinue = hasNextWord(word, state.usedWords);
            console.log(`[Nối Từ] Là từ đầu tiên. Có thể nối tiếp không? ${canContinue}`);

            if (!canContinue) {
                state.started = false;
                await message.react('❌');
                return await message.channel.send(`Không thể nối tiếp. Trò chơi kết thúc.`);
            }
            state.currentWord = word;
            state.usedWords.add(word);
            return await message.react('✅');
        }

        const match = isNextValid(state.currentWord, word);
        console.log(`[Nối Từ] Kiểm tra nối từ: ${state.currentWord} -> ${word}: ${match}`);

        if (match) {
            const canContinue = hasNextWord(word, state.usedWords);
            console.log(`[Nối Từ] Có thể tiếp tục sau từ ${word}? ${canContinue}`);

            state.currentWord = word;
            state.usedWords.add(word);
            await message.react('✅');

            if (!canContinue) {
                state.started = false;
                return await message.channel.send(`✅ Bạn đã nói từ cuối cùng có thể nối được: **${word}**. Trò chơi kết thúc.`);
            }

            return;
        }

        console.log(`[Nối Từ] Từ không nối đúng quy tắc.`);
        return await message.react('❌');
    }
};