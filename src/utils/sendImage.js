const fs = require('fs');
const path = require('path');
const { AttachmentBuilder } = require('discord.js');
const ImageChannel = require('../model/imageChannelModel');

async function sendImageByConfig(message) {
    try {
        // 1. Tìm config channel đã được set cho guild hiện tại
        const config = await ImageChannel.findOne({ guildId: message.guild.id });
        if (!config) return;

        const configuredChannelId = config.channelId;

        // 2. Nếu message không được gửi từ đúng kênh, bỏ qua
        if (message.channel.id !== configuredChannelId) return;

        // 3. Lấy danh sách ảnh từ thư mục
        const imageDir = path.join(__dirname, '..', 'assets', 'images');
        const files = fs.readdirSync(imageDir).filter(file =>
            /\.(png|jpg|jpeg|gif)$/i.test(file)
        );

        if (files.length === 0) {
            return message.reply('⚠ Không tìm thấy ảnh nào trong thư mục `assets/images`.');
        }

        // 4. Chọn ảnh ngẫu nhiên và gửi
        const randomImage = files[Math.floor(Math.random() * files.length)];
        const imagePath = path.join(imageDir, randomImage);
        const attachment = new AttachmentBuilder(imagePath);

        await message.channel.send({ files: [attachment] });

    } catch (error) {
        console.error('❌ Lỗi khi gửi ảnh:', error);
        await message.reply('⚠ Đã xảy ra lỗi khi gửi ảnh.');
    }
}

module.exports = sendImageByConfig;
