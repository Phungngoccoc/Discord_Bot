const fs = require('fs');
const path = require('path');
const { AttachmentBuilder } = require('discord.js');
const ImageChannel = require('../model/imageChannelModel');
const SentImage = require('../model/SentImageModel');

// Bộ nhớ RAM để chống xử lý song song trùng lặp
const processingLocks = new Set();

async function sendImageByConfig(message) {
    const guildId = message.guild.id;
    const content = message.content.trim().toLowerCase();
    const lockKey = `${guildId}:${content}`;

    // ✅ Nếu đang xử lý rồi thì bỏ qua
    if (processingLocks.has(lockKey)) return;
    processingLocks.add(lockKey);

    try {
        const config = await ImageChannel.findOne({ guildId });
        if (!config || message.channel.id !== config.channelId) return;

        const folderPath = path.join(__dirname, '..', 'assets', 'images', content);
        if (!fs.existsSync(folderPath)) return;

        const allFiles = fs.readdirSync(folderPath).filter(file =>
            /\.(png|jpe?g|gif|webp)$/i.test(file)
        );

        if (allFiles.length === 0) {
            return await message.reply('Thư mục ảnh trống.');
        }

        // Lấy danh sách ảnh đã gửi
        const sentDocs = await SentImage.find({ guildId, content });
        const sentFileNames = sentDocs.map(doc => doc.fileName);

        // Loại bỏ ảnh đã gửi
        let remainingFiles = allFiles.filter(file => !sentFileNames.includes(file));

        // Nếu gửi hết rồi thì reset
        if (remainingFiles.length === 0) {
            await SentImage.deleteMany({ guildId, content });
            remainingFiles = allFiles;
        }

        // Chọn ngẫu nhiên ảnh
        const randomImage = remainingFiles[Math.floor(Math.random() * remainingFiles.length)];
        const imagePath = path.join(folderPath, randomImage);
        const attachment = new AttachmentBuilder(imagePath);

        // Gửi ảnh
        await message.channel.send({ files: [attachment] });

        // Ghi nhận ảnh đã gửi
        await SentImage.create({ guildId, content, fileName: randomImage });

    } catch (error) {
        console.error('Lỗi khi gửi ảnh:', error);
        await message.reply('❌ Đã xảy ra lỗi khi gửi ảnh.');
    } finally {
        // ✅ Bỏ khoá sau khi xử lý xong
        processingLocks.delete(lockKey);
    }
}

module.exports = sendImageByConfig;
