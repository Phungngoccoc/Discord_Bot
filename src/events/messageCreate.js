const config = require("../config/config.js");
const sendImageByConfig = require('../utils/sendImage');
const { EmbedBuilder } = require('discord.js');
const wordGameManager = require('../utils/wordGameManager');
const countingGameManager = require('../utils/countingGameManager');
const GuildConfig = require('../model/guildConfig');
module.exports = async (client, message) => {
    if (message.author.bot || !message.guild) return;
    const content = message.content.trim().toLowerCase();
    const channelId = message.channel.id;
    const guildId = message.guild.id;
    // ✅ Gửi ảnh theo keyword
    if (['seg', 'girl', 'femboy', 'futa'].includes(content)) {
        await sendImageByConfig(message);
        return;
    }

    // ✅ Hiện help nếu tag bot
    if (content === `<@${client.user.id}>` || content === `<@!${client.user.id}>`) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({ name: 'Danh sách lệnh', iconURL: message.author.displayAvatarURL() })
            .setDescription(`Prefix của bot là ${process.env.PREFIX}. Bạn cũng có thể dùng slash command \`/help\``)
            .addFields(
                { name: "💰 Tiền", value: "``money`` ``rob`` ``crime`` ``work`` ``give``", inline: false },
                { name: "🎲 Mini games", value: "``bc`` ``caro`` ``bigcaro`` ``bj`` ``duel`` ``guess`` ``slot`` ``treasure`` ``chess`` ``mine`` ``quiz`` ``race``", inline: false },
                { name: "🚜 Nông trại", value: "``farm`` ``buyland`` ``buyseed`` ``storage`` ``sell`` ``harvest`` ``seed``", inline: false }
            );

        return await message.channel.send({ embeds: [embed] });
    }

    // ✅ Ưu tiên xử lý prefix command (dù đang chơi game)
    if (content.startsWith(config.prefix)) {
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.prefixCommands.get(commandName);
        if (message.guild.id !== process.env.GUILD_ID) {
            message.channel.send("Bot chỉ hoạt động trong server chính. Vui lòng lien hệ admin để được hỗ trợ.");
            return;
        };
        if (command) {
            try {
                await command.execute(message, args, client);
            } catch (error) {
                console.error(`Lỗi khi thực hiện lệnh ${commandName}:`, error);
                message.reply("Đã xảy ra lỗi khi thực hiện lệnh.");
            }
            return; // ⛔ Không xử lý nối từ nếu là lệnh
        }
    }

    // ✅ Xử lý nối từ (chỉ khi không phải lệnh)
    const state = wordGameManager.getState(channelId);
    if (state?.started) {
        const word = content;
        if (!wordGameManager.isEligibleWord(word)) return;

        if (state.usedWords.has(word) || !wordGameManager.isValidWord(word)) {
            return await message.react('❌');
        }

        if (!state.currentWord) {
            if (!wordGameManager.hasNextWord(word, state.usedWords)) {
                wordGameManager.stopGame(channelId);
                await message.react('❌');
                return await message.channel.send(`Không thể nối tiếp. Trò chơi kết thúc.`);
            }

            state.currentWord = word;
            state.usedWords.add(word);
            return await message.react('✅');
        }

        if (wordGameManager.isNextValid(state.currentWord, word)) {
            const canContinue = wordGameManager.hasNextWord(word, state.usedWords);
            state.currentWord = word;
            state.usedWords.add(word);
            await message.react('✅');

            if (!canContinue) {
                wordGameManager.stopGame(channelId);
                return await message.channel.send(`Bạn đã nói từ cuối cùng có thể nối được: **${word}**. Trò chơi kết thúc.`);
            }
        } else {
            await message.react('❌');
        }
    }
    const guildConfig = await GuildConfig.findOne({ guildId });
    if (guildConfig?.countingChannelId === channelId) {
        return countingGameManager.handleCount(message);
    }
};
