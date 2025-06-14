const queue = require("../../../utils/musicQueue");

module.exports = {
    name: "now",
    description: "Hiển thị bài hát đang phát",
    execute(message) {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue || !serverQueue.player || serverQueue.player.state.status !== "playing") {
            return message.reply("Không có bài nào đang phát.");
        }

        message.reply(`🎶 Đang phát: ${serverQueue.current}`);
    }
};