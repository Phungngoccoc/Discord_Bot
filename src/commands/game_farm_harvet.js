const Farm = require("../model/farmModel");
const User = require("../model/userModel");

module.exports = {
    name: "harvest",
    description: "Thu hoạch cây trồng đã chín và loại bỏ cây bị sâu.",
    execute: async (message, args) => {
        const userId = message.author.id;
        let user = await User.findOne({ userId });
        let farm = await Farm.findOne({ userId });

        if (!user || !farm) {
            return message.reply("❌ Bạn chưa có trang trại! Hãy mua đất trước.");
        }

        let now = Date.now();
        let harvestedCrops = [];
        let removedCrops = [];
        let newCrops = [];

        for (let crop of farm.crops) {
            let growTime = crop.harvestTime;
            let plantedAt = new Date(crop.plantedAt).getTime();
            let elapsedTime = now - plantedAt;
            let damageTime = growTime * 2; // Nếu quá 2 lần thời gian thu hoạch thì cây bị sâu

            if (elapsedTime >= damageTime) {
                removedCrops.push(crop.name); // Ghi lại cây bị sâu
                continue; // Không lưu vào newCrops => Cây sẽ bị xóa
            }

            if (elapsedTime >= growTime) {
                harvestedCrops.push(crop.name);
                user.storage[crop.name] = (user.storage[crop.name] || 0) + 1; // Cập nhật kho
            } else {
                newCrops.push(crop); // Giữ lại cây chưa thu hoạch và chưa bị sâu
            }
        }

        // Cập nhật farm, loại bỏ cây bị sâu
        farm.crops = newCrops;
        await user.save();
        await farm.save();

        // Thông báo kết quả
        let messages = [];

        if (harvestedCrops.length > 0) {
            let cropSummary = {};
            harvestedCrops.forEach(name => {
                cropSummary[name] = (cropSummary[name] || 0) + 1;
            });

            let harvestMessage = Object.entries(cropSummary)
                .map(([name, count]) => `🌱 ${name}: ${count} cây`)
                .join("\n");

            messages.push(`🎉 Bạn đã thu hoạch thành công:\n${harvestMessage}\n📦 Chúng đã được lưu vào kho.`);
        }

        if (removedCrops.length > 0) {
            let removeSummary = {};
            removedCrops.forEach(name => {
                removeSummary[name] = (removeSummary[name] || 0) + 1;
            });

            let removeMessage = Object.entries(removeSummary)
                .map(([name, count]) => `🪳 ${name}: ${count} cây bị sâu và đã bị xóa!`)
                .join("\n");

            messages.push(`🚨 Một số cây đã bị sâu và bị loại bỏ:\n${removeMessage}`);
        }

        if (messages.length === 0) {
            return message.reply("⚠️ Không có cây nào sẵn sàng để thu hoạch hoặc bị sâu!");
        }

        message.reply(messages.join("\n\n"));
    },
};
