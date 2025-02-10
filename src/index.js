require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const connectDB = require('./config/db');  // Thay đổi đường dẫn import
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});
connectDB();  // Kết nối với MongoDB

// Tạo Collection để lưu các lệnh Slash
client.commands = new Collection();

// Load lệnh Slash từ thư mục commands/
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));

        if (!command || !command.data || typeof command.execute !== "function") {
            continue;
        }

        client.commands.set(command.data.name, command);
    }
} else {
    console.error("❌ Không tìm thấy thư mục 'commands'!");
}

// Load sự kiện
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        client.on(file.split(".")[0], (...args) => event(client, ...args));
    }
}

// Kết nối bot
const config = require("./config/config.js");
client.login(config.token);
