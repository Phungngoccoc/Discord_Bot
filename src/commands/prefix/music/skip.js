const queue = require("../../../utils/musicQueue");

module.exports = {
    name: "skip",
    description: "Bỏ qua bài hát hiện tại",
    execute(message) {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue || !serverQueue.player) return message.reply("Không có bài nào đang phát.");
        serverQueue.player.stop();
        message.reply("Đã bỏ qua bài hiện tại.");
    }
};
