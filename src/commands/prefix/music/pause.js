const queue = require("../../../utils/musicQueue");

module.exports = {
    name: "pause",
    description: "Tạm dừng phát nhạc",
    execute(message) {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue || !serverQueue.player) return message.reply("Không có bài nào đang phát.");
        serverQueue.player.pause();
        message.reply("Nhạc đã được tạm dừng.");
    }
};