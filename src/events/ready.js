const { ActivityType } = require("discord.js");

module.exports = (client) => {
    console.log(`✅ Bot đã online với tên: ${client.user.tag}`);
    
    // Set activity cho bot
    client.user.setActivity({
        name: "saygex",
        type: ActivityType.Streaming,
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
};