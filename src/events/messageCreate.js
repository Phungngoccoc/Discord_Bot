const config = require("../config/config.js");
const sendImageByConfig = require('../utils/sendImage');
const { EmbedBuilder } = require('discord.js');
module.exports = async (client, message) => {
    if (message.content.trim().toLowerCase() === 'seg' || message.content.trim().toLowerCase() === 'girl'
        || message.content.trim().toLowerCase() === 'femboy' || message.content.trim().toLowerCase() === 'futa') {
        await sendImageByConfig(message);
        return;
    }
    if (
        message.content.trim() === `<@${message.client.user.id}>` ||
        message.content.trim() === `<@!${message.client.user.id}>`
    ) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({
                name: 'Danh sách lệnh',
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription(`Prefix của bot là ${process.env.PREFIX}. Bạn cũng có thể dùng slash command /help`)
            .addFields(
                { name: "💰 Tiền", value: "``money`` ``rob`` ``crime`` ``work`` ``give``", inline: false },
                { name: "🎲 Mini games", value: "``bc`` ``caro`` ``bigcaro`` ``bj`` ``duel`` ``guess`` ``slot`` ``treasure`` ``chess`` ``mine`` ``quiz`` ``race``", inline: false },
                { name: "🚜 Nông trại", value: "``farm`` ``buyland`` ``buyseed`` ``storage`` ``sell`` ``harvest`` ``seed``", inline: false }
            );

        await message.channel.send({ embeds: [embed] });
    }
    if (message.author.bot || !message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(`Lỗi khi thực hiện lệnh ${commandName}:`, error);
        message.reply("Đã xảy ra lỗi khi thực hiện lệnh.");
    }
};
