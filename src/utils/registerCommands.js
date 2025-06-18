const { REST, Routes } = require("discord.js");
const config = require("../config/config.js");

const commands = [
    {
        name: "test",
        description: "Kiểm tra bot có nhận slash command hay không!"
    },
    {
        name: "help",
        description: "Danh sách lệnh của bot"
    },
];

async function registerCommands() {
    const rest = new REST({ version: "10" }).setToken(config.token);

    try {
        console.log("🔄 Đang đăng ký GLOBAL slash commands...");
        // await rest.put(Routes.applicationCommands(config.clientId), {
        //     body: commands,
        // });
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );
        console.log("✅ Đăng ký thành công GLOBAL commands!");
    } catch (error) {
        console.error("❌ Lỗi khi đăng ký:", error);
    }
}

registerCommands();
