const queue = require("../../../utils/musicQueue");

module.exports = {
    name: "stop",
    description: "Dừng phát nhạc và xóa hàng chờ",
    execute(message) {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) return message.reply("Không có gì để dừng.");

        serverQueue.songs = [];
        serverQueue.player.stop();
        serverQueue.connection.destroy();
        queue.delete(message.guild.id);

        message.reply("Bot đã dừng và rời khỏi voice channel.");
    }
};
