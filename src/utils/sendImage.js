const fs = require('fs');
const path = require('path');
const { AttachmentBuilder } = require('discord.js');
const ImageChannel = require('../model/imageChannelModel');
const SentImage = require('../model/SentImageModel');

async function sendImageByConfig(message) {
    try {
        const guildId = message.guild.id;
        const content = message.content.trim().toLowerCase();
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

        const sentDocs = await SentImage.find({ guildId, content });
        const sentFileNames = sentDocs.map(doc => doc.fileName);

        let remainingFiles = allFiles.filter(file => !sentFileNames.includes(file));

        if (remainingFiles.length === 0) {
            await SentImage.deleteMany({ guildId, content });
            remainingFiles = allFiles;
        }
        const randomImage = remainingFiles[Math.floor(Math.random() * remainingFiles.length)];
        const imagePath = path.join(folderPath, randomImage);
        const attachment = new AttachmentBuilder(imagePath);

        await message.channel.send({ files: [attachment] });

        await SentImage.create({ guildId, content, fileName: randomImage });

    } catch (error) {
        console.error('Lỗi khi gửi ảnh:', error);
        await message.reply('Có lỗi khi gửi ảnh.');
    }
}

module.exports = sendImageByConfig;
