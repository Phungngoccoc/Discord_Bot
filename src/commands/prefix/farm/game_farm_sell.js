const User = require("../../../model/userModel");
const { crops } = require("../../../utils/constants");

module.exports = {
    name: "sell",
    description: "Bán nông sản đã thu hoạch để kiếm tiền.",
    execute: async (message, args) => {
        const userId = message.author.id;
        let user = await User.findOne({ userId });

        if (!user || !user.storage || user.storage.size === 0) {
            return message.reply("⚠️ Bạn không có nông sản nào để bán!");
        }

        let totalEarnings = 0;
        let sellDetails = [];

        for (let [crop, quantity] of user.storage.entries()) {
            if (crops[crop] && quantity > 0) {
                let earnings = crops[crop].sellPrice * quantity;

                totalEarnings += earnings;
                sellDetails.push(`💰 **${crop}**: ${quantity} cây → **+${earnings} xu**`);

                user.storage.delete(crop); // Xóa đúng cách
            }
        }

        if (totalEarnings === 0) {
            return message.reply("⚠️ Bạn không có nông sản nào để bán!");
        }

        user.money += totalEarnings;
        await user.save();

        message.reply(`🛒 **Bán nông sản thành công!**\n${sellDetails.join("\n")}\n\n💵 Tổng tiền nhận được: **${totalEarnings} xu**`);
    },
};
