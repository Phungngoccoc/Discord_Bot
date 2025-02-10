require("dotenv").config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    prefix: "k",
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
};
