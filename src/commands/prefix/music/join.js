const { joinVoiceChannel } = require("@discordjs/voice");

module.exports = {
    name: "join",
    description: "Tham gia voice channel hiện tại của bạn",
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply("Bạn cần tham gia một voice channel trước!");
        }

        try {
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
        } catch (error) {
            console.error("Lỗi khi tham gia voice channel:", error);
            message.reply("Không thể tham gia voice channel!");
        }
    },
};
