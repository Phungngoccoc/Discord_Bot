const { crops } = require("../../../utils/constants");
const User = require("../../../model/userModel");

module.exports = {
    name: "storage",
    description: "Kiểm tra số lượng nông sản trong kho.",
    execute: async (message, args) => {
        const userId = message.author.id;
        let user = await User.findOne({ userId });

        if (!user) {
            return message.reply("Bạn chưa có trang trại! Dùng lệnh farm để tạo nông trại mới.");
        }

        let storage = user.storage || new Map();
        if (storage.size === 0) {
            return message.reply("Kho của bạn đang trống. Hãy thu hoạch để có nông sản!");
        }

        let storageDisplay = "**Kho nông sản của bạn:**\n";
        storage.forEach((quantity, crop) => {
            const emoji = crops[crop]?.emoji || "🌱"; 
            storageDisplay += `${emoji} **${crop}**: ${quantity}\n`;
        });

        message.reply(storageDisplay);
    },
};
