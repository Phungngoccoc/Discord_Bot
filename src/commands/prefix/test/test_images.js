const { AttachmentBuilder } = require("discord.js");
const path = require("path");

module.exports = {
    name: "image",
    description: "Gửi ảnh kèm tin nhắn",
    execute(message) {
        const imagePath = path.join(__dirname, "../assets/avt.png");
        const attachment = new AttachmentBuilder(imagePath);
        message.reply({ content: "Đây là ảnh của bạn 📷", files: [attachment] });
    },
};
