const { ActivityType } = require("discord.js");

module.exports = (client) => {
    console.log(`Bot đã online với tên: ${client.user.tag}`);
    console.log(`🌐 Bot đang ở ${client.guilds.cache.size} server(s)`);
    // client.guilds.cache.forEach(guild => {
    //     console.log(`- ${guild.name} (${guild.id}) | Members: ${guild.memberCount}`);
    // });
    // Set activity cho bot
    client.user.setActivity({
        name: "saygex",
        type: ActivityType.Streaming,
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
};