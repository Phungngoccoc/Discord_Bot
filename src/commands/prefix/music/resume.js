const queue = require("../../../utils/musicQueue");

module.exports = {
    name: "resume",
    description: "Tiếp tục phát nhạc",
    execute(message) {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue || !serverQueue.player) return message.reply("Không có bài nào bị tạm dừng.");
        serverQueue.player.unpause();
        message.reply("Nhạc đã tiếp tục.");
    }
};