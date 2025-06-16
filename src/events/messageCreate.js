const config = require("../config/config.js");
const sendImageByConfig = require('../utils/sendImage');

module.exports = async (client, message) => {
    if (message.content.trim().toLowerCase() === 'seg') {
        await sendImageByConfig(message);
        return;
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
