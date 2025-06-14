const queue = require("../../../utils/musicQueue");

module.exports = {
    name: "leave",
    description: "Bot rời khỏi voice channel",
    execute(message) {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) return message.reply("Bot không ở trong voice channel.");

        serverQueue.player.stop();
        serverQueue.connection.destroy();
        queue.delete(message.guild.id);

        message.reply("Bot đã rời khỏi voice channel.");
    }
};