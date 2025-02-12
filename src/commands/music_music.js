require("dotenv").config();
const { google } = require("googleapis");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require("@discordjs/voice");
const play = require("play-dl");
const ffmpeg = require("ffmpeg-static");

const queue = new Map(); // Hàng chờ phát nhạc

const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
});

module.exports = {
    name: "m",
    description: "Điều khiển nhạc trong voice channel",
    async execute(message) {
        if (!message.content.startsWith("km")) return;

        const args = message.content.split(" ").slice(1);
        const command = args.shift();
        const url = args[0];
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) return message.reply("❌ Bạn phải vào voice channel trước!");

        const serverQueue = queue.get(message.guild.id);
        switch (command) {
            case "play":
                if (!url) {
                    return message.reply("❌ Bạn phải cung cấp một URL hợp lệ!");
                }

                if (url.includes("youtube.com") || url.includes("youtu.be")) {
                    const video = await searchYouTube(url);
                    if (!video) return message.reply("❌ Không tìm thấy video trên YouTube.");
                    playMusic(message, video.url, voiceChannel);
                } else if (await play.validate(url)) {
                    playMusic(message, url, voiceChannel);
                } else {
                    return message.reply("❌ URL không hợp lệ!");
                }
                break;
            case "stop":
                stopMusic(message, serverQueue);
                break;
            case "skip":
                skipMusic(message, serverQueue);
                break;
            case "queue":
                showQueue(message, serverQueue);
                break;
            default:
                message.reply("❌ Lệnh không hợp lệ! Dùng `km play <url>`, `km stop`, `km skip`, `km queue`.");
        }
    },
};

// Tìm kiếm video trên YouTube
async function searchYouTube(query) {
    try {
        const res = await youtube.search.list({
            part: "snippet",
            q: query,
            maxResults: 1,
        });
        const video = res.data.items[0];
        if (video) {
            return {
                title: video.snippet.title,
                url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            };
        }
    } catch (err) {
        console.error("Lỗi tìm kiếm YouTube:", err);
    }
    return null;
}

// Hàm phát nhạc
async function playMusic(message, url, voiceChannel) {
    const guildId = message.guild.id;
    let serverQueue = queue.get(guildId);

    if (!serverQueue) {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guildId,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer({
            behaviors: { noSubscriber: NoSubscriberBehavior.Play },
        });

        serverQueue = { connection, player, songs: [] };
        queue.set(guildId, serverQueue);

        serverQueue.songs.push(url);
        playNext(message, serverQueue);
    } else {
        serverQueue.songs.push(url);
        message.reply(`🎶 Đã thêm vào hàng chờ: ${url}`);
    }
}

// Hàm phát bài tiếp theo
async function playNext(message, serverQueue) {
    if (!serverQueue.songs.length) {
        message.reply("📭 Hết nhạc! Bot sẽ rời khỏi voice channel sau 5 giây.");

        setTimeout(() => {
            if (serverQueue.connection) {
                serverQueue.connection.destroy();
                queue.delete(message.guild.id);
            }
        }, 5000);

        return;
    }

    const song = serverQueue.songs.shift();
    try {
        const stream = await play.stream(song, { quality: 2 }); // Chỉnh chất lượng lên cao nhất
        const resource = createAudioResource(stream.stream, { inputType: stream.type });

        serverQueue.player.play(resource);
        serverQueue.connection.subscribe(serverQueue.player);

        message.reply(`🎵 Đang phát: ${song}`);

        serverQueue.player.once(AudioPlayerStatus.Idle, () => {
            playNext(message, serverQueue);
        });
    } catch (error) {
        message.reply("❌ Lỗi khi phát nhạc! Bỏ qua bài này.");
        console.error(error);
        playNext(message, serverQueue);
    }
}

// Hàm dừng nhạc
function stopMusic(message, serverQueue) {
    if (!serverQueue) return message.reply("❌ Không có bài nào đang phát!");

    serverQueue.songs = [];
    serverQueue.player.stop();
    serverQueue.connection.destroy();
    queue.delete(message.guild.id);

    message.reply("⏹ Đã dừng nhạc!");
}

// Hàm bỏ qua bài hát
function skipMusic(message, serverQueue) {
    if (!serverQueue || serverQueue.songs.length === 0) {
        return message.reply("❌ Không có bài nào để bỏ qua!");
    }

    serverQueue.player.stop();
    playNext(message, serverQueue);
    message.reply("⏭ Đã bỏ qua bài hiện tại!");
}

// Hiển thị danh sách hàng chờ
function showQueue(message, serverQueue) {
    if (!serverQueue || serverQueue.songs.length === 0) {
        return message.reply("📭 Hàng chờ trống!");
    }

    const queueList = serverQueue.songs.map((song, index) => `${index + 1}. ${song}`).join("\n");
    message.reply(`🎶 **Danh sách hàng chờ:**\n${queueList}`);
}
