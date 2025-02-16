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
        let newCrops = [];

        for (let crop of farm.crops) {
            let growTime = crop.harvestTime;
            let plantedAt = new Date(crop.plantedAt).getTime();
            let elapsedTime = now - plantedAt;
            let damageTime = growTime * 2; // Nếu quá 2 lần thời gian thu hoạch thì cây bị sâu

            if (elapsedTime >= damageTime) {
                continue; // Bỏ cây bị sâu, không thêm vào newCrops => Cây sẽ bị xóa
            }

            if (elapsedTime >= growTime && !crop.isHarvested) {
                harvestedCrops.push(crop.name);
                user.storage.set(crop.name, (user.storage.get(crop.name) || 0) + 1); // Cập nhật kho
            } else {
                newCrops.push(crop); // Giữ lại cây chưa thu hoạch và chưa bị sâu
            }
        }

        farm.crops = newCrops; // Cập nhật danh sách cây trồng (loại bỏ cây bị sâu)
        await user.save();
        await farm.save();

        if (harvestedCrops.length === 0) {
            return message.reply("⚠️ Không có cây nào sẵn sàng để thu hoạch!");
        }

        message.reply(`🎉 Bạn đã thu hoạch **${harvestedCrops.length}** cây! Chúng đã được lưu vào kho. 📦`);
    },
};
