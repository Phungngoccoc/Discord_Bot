const config = require("../config/config.js");
const fs = require("fs");
const path = require("path");

module.exports = (client, message) => {
    if (message.author.bot || !message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Lấy đường dẫn chính xác đến thư mục `commands`
    const commandsPath = path.join(__dirname, "../commands");

    if (!fs.existsSync(commandsPath)) {
        console.error("❌ Thư mục commands không tồn tại!");
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
    const commands = new Map();

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        commands.set(command.name, command);
    }

    if (commands.has(commandName)) {
        try {
            commands.get(commandName).execute(message, args); // ✅ Truyền thêm `args`
        } catch (error) {
            console.error(`❌ Lỗi khi thực hiện lệnh ${commandName}:`, error);
            message.reply("⚠ Đã xảy ra lỗi khi thực hiện lệnh.");
        }
    }
};
