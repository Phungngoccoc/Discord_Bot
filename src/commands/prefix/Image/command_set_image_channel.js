const { setImageChannel } = require('../../../service/imageChannelService');

module.exports = {
    name: 'setimagechannel',
    description: '📸 Đặt kênh để bot gửi ảnh khi ai đó nhắn "image"',
    execute: async (message) => {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Bạn cần quyền **Admin** để dùng lệnh này.');
        }

        const guildId = message.guild.id;
        const channelId = message.channel.id;

        try {
            await setImageChannel(guildId, channelId);
            message.reply(`Đã đặt kênh gửi ảnh là <#${channelId}>.`);
        } catch (err) {
            console.error(err);
            message.reply('Có lỗi xảy ra khi lưu kênh.');
        }
    }
};
