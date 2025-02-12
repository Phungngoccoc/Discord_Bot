const { REST, Routes } = require("discord.js");
const config = require("../config/config.js"); // Import config

const commands = [
    {
        name: "caro",
        description: "Chơi cờ caro (tic-tac-toe) với bạn bè!"
    },
    {
        name: "test",
        description: "Kiểm tra bot có nhận lệnh Slash Command hay không!"
    },
    {
        name: "phatnhac",
        description: "Phát nhạc từ YouTube",
        options: [
            {
                type: 3,
                name: "url",
                description: "URL của video YouTube",
                required: true,
            }
        ]
    }, {
        name: "chess",
        description: "Chơi cờ vua với bạn bè!",
    }
];

async function registerCommands() {
    console.log("🔎 Config:", config); // Debug kiểm tra token, clientId, guildId

    const rest = new REST({ version: "10" }).setToken(config.token);

    try {
        console.log("🔄 Đang đăng ký lệnh Slash...");
        await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
            body: commands,
        });
        console.log("✅ Đăng ký lệnh thành công!");
    } catch (error) {
        console.error("❌ Lỗi khi đăng ký lệnh:", error);
    }
}

registerCommands();
