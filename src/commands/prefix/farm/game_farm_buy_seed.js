const Farm = require("../../../model/farmModel");
const User = require("../../../model/userModel");
const { crops } = require("../../../utils/constants"); // Đảm bảo import đúng

module.exports = {
    name: "buyseed",
    description: "Mua hạt giống để trồng trọt.",
    execute: async (message, args) => {
        const userId = message.author.id;
        let user = await User.findOne({ userId });
        let farm = await Farm.findOne({ userId });

        if (!user || !farm) {
            return message.reply("Bạn chưa có trang trại! Dùng lệnh farm để tạo nông trại mới.");
        }

        if (args.length < 1) {
            return message.reply("Vui lòng nhập tên hạt giống muốn mua!");
        }

        let seedName = args[0].toLowerCase();
        let quantity = args[1] ? parseInt(args[1]) : 1; // Mặc định mua 1 hạt nếu không nhập số lượng

        if (!crops[seedName]) {
            return message.reply(
                "Hạt giống không hợp lệ! Các loại có sẵn: " + Object.keys(crops).join(", ") + "."
            );
        }

        let availableLand = farm.landSlots - farm.crops.length; // Ô đất trống
        if (quantity > availableLand) {
            return message.reply(`Bạn chỉ có **${availableLand}** ô đất trống, không thể mua **${quantity}** hạt giống!`);
        }

        let totalCost = crops[seedName].buyPrice * quantity;
        if (user.money < totalCost) {
            return message.reply(`Bạn không đủ tiền! Cần **${totalCost} xu**, bạn chỉ có **${user.money} xu**.`);
        }

        // Trừ tiền và thêm cây vào danh sách
        user.money -= totalCost;
        for (let i = 0; i < quantity; i++) {
            farm.crops.push({
                name: seedName,
                plantedAt: new Date(),
                harvestTime: crops[seedName].harvestTime, // Thời gian thu hoạch
                isHarvested: false,
                isDamaged: false,
                fertilizerUsed: false
            });
        }

        await user.save();
        await farm.save();

        message.reply(`🌱 Bạn đã mua **${quantity}** hạt giống **${seedName}** với giá **${totalCost} xu**!`);
    },
};
