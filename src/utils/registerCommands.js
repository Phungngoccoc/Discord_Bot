const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config/config.js");

const commands = [];

// Đệ quy duyệt tất cả file trong commands/slash
function loadCommandsRecursively(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadCommandsRecursively(fullPath); // Đệ quy thư mục con
        } else if (file.endsWith(".js")) {
            const command = require(fullPath);
            if (command.data) {
                commands.push(command.data.toJSON());
            } else {
                console.warn(`⚠ Không tìm thấy 'data' trong file: ${fullPath}`);
            }
        }
    }
}

const commandsPath = path.join(__dirname, "../commands/slash");
loadCommandsRecursively(commandsPath);

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
    try {
        console.log("🔄 Đang đăng ký slash commands...");
        // Chọn một trong hai:
        // 🔹 GUILD (test nhanh)
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );

        // 🔹 GLOBAL (chậm, nhưng dùng chung toàn server)
        const temp = await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );
        console.log(`✅ Đăng ký thành công ${commands.length} slash commands!`);
    } catch (error) {
        console.error("❌ Lỗi khi đăng ký:", error);
    }
})();
