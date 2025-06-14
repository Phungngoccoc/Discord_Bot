const queue = require("../../../utils/musicQueue");

module.exports = {
    name: "queue",
    description: "Xem danh sách bài hát trong hàng chờ",
    execute(message) {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue || !serverQueue.songs.length) return message.reply("Hàng chờ trống.");

        const queueList = serverQueue.songs.map((song, i) => `${i + 1}. ${song}`).join("\n");
        message.reply(`**Hàng chờ:**\n${queueList}`);
    }
};