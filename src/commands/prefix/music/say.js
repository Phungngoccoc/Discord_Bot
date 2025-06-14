const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    NoSubscriberBehavior,
    AudioPlayerStatus,
    StreamType,
} = require("@discordjs/voice");
const googleTTS = require("google-tts-api");
const https = require("https");

module.exports = {
    name: "say",
    description: "Bot sẽ nói nội dung bạn nhập bằng giọng Google",
    async execute(message) {
        const args = message.content.split(" ").slice(1);
        const text = args.join(" ");

        if (!text) return message.reply("❌ Bạn cần nhập nội dung để bot nói!");

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply("❌ Bạn cần vào voice channel trước!");

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("Connect") || !permissions.has("Speak")) {
            return message.reply("❌ Bot không có quyền `Connect` hoặc `Speak`!");
        }

        try {
            const url = googleTTS.getAudioUrl(text, {
                lang: "vi",
                slow: false,
                host: "https://translate.google.com",
            });

            console.log("🔊 Stream URL:", url);

            const audioStream = await new Promise((resolve, reject) => {
                https.get(url, (res) => {
                    if (res.statusCode !== 200) return reject(new Error("Không thể tải âm thanh TTS"));
                    console.log("🎧 Stream ready");
                    resolve(res); // Trả về stream MP3
                }).on("error", reject);
            });

            const resource = createAudioResource(audioStream, {
                inputType: StreamType.Arbitrary, // ✅ Quan trọng: mp3 không có định dạng cố định
            });
            console.log("📦 Resource created");

            const player = createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Stop },
            });

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: false,
            });

            console.log("🔗 Bot đã join voice channel");

            connection.subscribe(player);
            player.play(resource);

            message.channel.send(`🗣️ Bot đang nói: "${text}"`);

            player.on(AudioPlayerStatus.Idle, () => {
                console.log("⏹️ AudioPlayer Idle. Disconnecting...");
                // connection.destroy();
            });

        } catch (error) {
            console.error("❌ Lỗi khi nói:", error);
            message.reply("❌ Bot gặp lỗi khi nói.");
        }
    }
};
