const Farm = require("../../../model/farmModel");
const User = require("../../../model/userModel");

module.exports = {
    name: "buyland",
    description: "Mua thêm ô đất để mở rộng nông trại.",
    execute: async (message, args) => {
        const userId = message.author.id;
        let user = await User.findOne({ userId });
        let farm = await Farm.findOne({ userId });

        if (!user || !farm) {
            return message.reply("Bạn chưa có trang trại! Dùng lệnh farm để tạo nông trại mới");
        }

        let landToBuy = parseInt(args[0]);
        if (isNaN(landToBuy) || landToBuy <= 0) {
            return message.reply("Vui lòng nhập số ô đất hợp lệ cần mua!");
        }

        if (farm.landSlots + landToBuy > 100) {
            return message.reply(`Bạn không thể mua quá 100 ô đất! Hiện tại bạn có **${farm.landSlots}** ô.`);
        }

        let totalCost = landToBuy * 100; 
        if (user.money < totalCost) {
            return message.reply(`Bạn không đủ tiền! Cần **${totalCost}** xu để mua ${landToBuy} ô đất.`);
        }

        farm.landSlots += landToBuy;
        user.money -= totalCost;

        await farm.save();
        await user.save();
        message.reply(`Bạn đã mua **${landToBuy}** ô đất! Hiện có **${farm.landSlots}/100** ô.`);
    },
};
