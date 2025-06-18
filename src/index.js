require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const connectDB = require('./config/db');
const config = require("./config/config.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION", "USER"],
});

connectDB();
const readyCheck = require("./auto/harvest_check.js");
readyCheck.execute(client);

client.prefixCommands = new Collection();
client.slashCommands = new Collection();

// Hàm đệ quy để load command
function loadCommandsRecursively(dirPath, isSlash = false) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            loadCommandsRecursively(fullPath, isSlash);
        } else if (entry.name.endsWith(".js")) {
            const command = require(fullPath);
            if (isSlash && command?.data && typeof command.execute === "function") {
                client.slashCommands.set(command.data.name, command);
            } else if (!isSlash && command?.name && typeof command.execute === "function") {
                client.prefixCommands.set(command.name, command);
            }
        }
    }
}

// Load prefix commands
loadCommandsRecursively(path.join(__dirname, "commands/prefix"), false);

// Load slash commands
loadCommandsRecursively(path.join(__dirname, "commands/slash"), true);

// Load events
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        client.on(file.split(".")[0], (...args) => event(client, ...args));
    }
}

// Kết nối bot
client.login(config.token);
