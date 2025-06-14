const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior,
} = require("@discordjs/voice");
const play = require("play-dl");

const queue = require("../../../utils/musicQueue");

module.exports = {
    name: "play",
    description: "Phát nhạc từ YouTube hoặc Spotify",
    async execute(message) {
        const args = message.content.split(" ").slice(1);
        let url = args[0];

        if (!url) return message.reply("❌ Bạn cần cung cấp URL!");

        url = url.replace("m.youtube.com", "www.youtube.com");
        console.log("🔍 URL chuẩn hóa:", url);

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply("❌ Bạn cần vào voice channel trước!");

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("Connect") || !permissions.has("Speak")) {
            return message.reply("❌ Bot không có quyền `Connect` hoặc `Speak`!");
        }

        let serverQueue = queue.get(message.guild.id);

        if (!serverQueue) {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
            });

            serverQueue = {
                voiceChannel,
                connection,
                player,
                songs: [],
                playing: false,
            };

            queue.set(message.guild.id, serverQueue);
            serverQueue.connection.subscribe(player);
        }

        serverQueue.songs.push(url);
        message.channel.send(`🎵 Đã thêm vào hàng chờ: ${url}`);
        console.log("📥 Danh sách hàng chờ:", serverQueue.songs);

        if (!serverQueue.playing) {
            serverQueue.playing = true;
            try {
                await playNext(message, serverQueue);
            } catch (err) {
                console.error("❌ Lỗi khi phát nhạc:", err);
                message.channel.send("❌ Đã xảy ra lỗi khi phát nhạc.");
                serverQueue.playing = false;
            }
        }
    },
};

const playNext = async (message, serverQueue) => {
    if (!serverQueue || serverQueue.songs.length === 0) {
        console.log("⛔ Hết nhạc trong hàng chờ.");
        // serverQueue.connection.destroy();
        // queue.delete(message.guild.id);
        return;
    }

    const url = serverQueue.songs[0];
    console.log("▶️ Đang phát:", url);

    try {
        const info = await play.video_info(url);
        const stream = await play.stream(info);
        console.log(stream)
        const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
        });

        serverQueue.player.play(resource);
        serverQueue.connection.subscribe(serverQueue.player);

        serverQueue.player.once(AudioPlayerStatus.Idle, () => {
            serverQueue.songs.shift();
            playNext(message, serverQueue);
        });

    } catch (error) {
        console.error("❌ Lỗi stream URL:", error);
        serverQueue.songs.shift();
        playNext(message, serverQueue);
    }
};
