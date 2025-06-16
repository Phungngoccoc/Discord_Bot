const fs = require('fs');
const path = require('path');
const { AttachmentBuilder } = require('discord.js');
const ImageChannel = require('../model/imageChannelModel');

// Map lưu ảnh đã gửi theo: { guildId: { folderName: [file1, file2, ...] } }
const sentImagesMap = new Map();

async function sendImageByConfig(message) {
    try {
        const guildId = message.guild.id;
        const content = message.content.trim().toLowerCase();
        console.log(content)
        // 1. Kiểm tra kênh hợp lệ
        const config = await ImageChannel.findOne({ guildId });
        if (!config || message.channel.id !== config.channelId) return;

        // 2. Kiểm tra xem content có phải là tên thư mục trong assets/images không
        const folderPath = path.join(__dirname, '..', 'assets', 'images', content);
        if (!fs.existsSync(folderPath)) return;

        const allFiles = fs.readdirSync(folderPath).filter(file =>
            /\.(png|jpe?g|gif)$/i.test(file)
        );

        if (allFiles.length === 0) {
            return await message.reply('⚠ Thư mục ảnh trống.');
        }

        const guildImages = sentImagesMap.get(guildId) || {};
        const sentFiles = guildImages[content] || [];

        let remainingFiles = allFiles.filter(file => !sentFiles.includes(file));

        if (remainingFiles.length === 0) {
            guildImages[content] = [];
            remainingFiles = allFiles;
        }

        const randomImage = remainingFiles[Math.floor(Math.random() * remainingFiles.length)];
        const imagePath = path.join(folderPath, randomImage);
        const attachment = new AttachmentBuilder(imagePath);

        await message.channel.send({ files: [attachment] });

        // Cập nhật danh sách ảnh đã gửi
        guildImages[content] = [...(guildImages[content] || []), randomImage];
        sentImagesMap.set(guildId, guildImages);

    } catch (error) {
        console.error('❌ Lỗi khi gửi ảnh:', error);
        await message.reply('⚠ Có lỗi khi gửi ảnh.');
    }
}

module.exports = sendImageByConfig;
