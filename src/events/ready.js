const { ActivityType } = require("discord.js");

module.exports = (client) => {
    console.log(`Bot đã online với tên: ${client.user.tag}`);
    console.log(`🌐 Bot đang ở ${client.guilds.cache.size} server(s)`);
    // client.guilds.cache.forEach(guild => {
    //     console.log(`- ${guild.name} (${guild.id}) | Members: ${guild.memberCount}`);
    // });
    // client.guilds.fetch('1303194004929646672')
    //     .then(guild => {
    //         guild.leave().then(() => {
    //             console.log(`Đã rời khỏi guild: ${guild.name} (${guild.id})`);
    //         }).catch(console.error);
    //     })
    //     .catch(err => {
    //         console.error('Không tìm thấy guild:', err);
    //     });
    // Set activity cho bot
    client.user.setActivity({
        name: "saygex",
        type: ActivityType.Streaming,
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
};