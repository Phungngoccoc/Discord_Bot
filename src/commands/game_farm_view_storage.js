const { crops } = require("../utils/constants");
const User = require("../model/userModel");

module.exports = {
    name: "storage",
    description: "Kiểm tra số lượng nông sản trong kho.",
    execute: async (message, args) => {
        const userId = message.author.id;
        let user = await User.findOne({ userId });

        if (!user) {
            return message.reply("❌ Bạn chưa có trang trại! Hãy bắt đầu bằng cách mua đất.");
        }

        let storage = user.storage || new Map();
        if (storage.size === 0) {
            return message.reply("📦 Kho của bạn đang trống. Hãy thu hoạch để có nông sản!");
        }

        let currentTime = Date.now();
        let storageDisplay = "📦 **Kho nông sản của bạn:**\n";

        storage.forEach((cropData, cropName) => {
            const { quantity, plantTime } = cropData;
            const cropInfo = crops[cropName];

            if (!cropInfo) return;

            const { emoji, harvestTime } = cropInfo;
            let elapsedTime = (currentTime - plantTime) / 1000; // Thời gian trồng đã trôi qua (giây)
            let growthEmoji = "🌱"; // Mặc định là cây non

            if (elapsedTime >= harvestTime * 1.5) {
                growthEmoji = "🐛"; // Cây bị sâu ăn mất
            } else if (elapsedTime >= harvestTime) {
                growthEmoji = emoji; // Cây đã chín
            } else if (elapsedTime >= harvestTime / 2) {
                growthEmoji = "🌿"; // Cây trưởng thành (chưa chín)
            } else {
                growthEmoji = "🌱"; // Cây mới nảy mầm
            }

            storageDisplay += `${growthEmoji} **${cropName}**: ${quantity} cây\n`;
        });

        message.reply(storageDisplay);
    },
};
