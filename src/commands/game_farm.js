const Farm = require("../model/farmModel");
const { EmbedBuilder } = require('discord.js');
const { crops } = require("../utils/constants");

module.exports = {
    name: "farm",
    description: "Xem trang trại của bạn.",
    execute: async (message, args) => {
        const userId = message.author.id;
        let farm = await Farm.findOne({ userId });

        if (!farm) {
            farm = new Farm({
                userId,
                landSlots: 10,
                crops: Array(10).fill(null)
            });
            await farm.save();
        }
        if (args[0] === "help") {
            const helpEmbed = new EmbedBuilder()
                .setColor("#4CAF50")
                .setTitle("📜 Hướng dẫn chơi nông trại")
                .setDescription("Các lệnh cơ bản để quản lý trang trại của bạn.")
                .addFields(
                    { name: "🌱 Mua đất", value: "kbuyland <số ô> - Mua thêm đất để trồng trọt.", inline: true },
                    { name: "🌾 Mua giống", value: "kbuyseed <loại> <số lượng> - Mua hạt giống sẽ tự động trồng trồng.", inline: true },
                    { name: "🌾 Xem giống", value: "kseed - Xem danh sách hạt giống có sẵn.", inline: true },
                    { name: "⏳ Thu hoạch", value: "kharvest - Thu hoạch cây trồng đã chín.", inline: true },
                    { name: "💰 Bán nông sản", value: "ksell - Bán sản phẩm thu hoạch để kiếm xu.", inline: true },
                    { name: "📦 Xem kho", value: "kstorage - Xem kho chứa nông sản.", inline: true },
                    { name: "🏡 Xem trang trại", value: "kfarm - Hiển thị trang trại của bạn.", inline: true }
                )
                .setFooter({ text: "Chúc bạn vui vẻ với trang trại của mình! 🌻" });

            return message.reply({ embeds: [helpEmbed] });
        }
        let landGrid = Array(farm.landSlots).fill("🟫"); // Mặc định là đất trống
        const currentTime = Date.now();

        farm.crops.forEach((crop, index) => {
            if (!crop) return;

            const elapsedTime = currentTime - new Date(crop.plantedAt).getTime();
            const halfGrowthTime = crop.harvestTime / 2;
            const fullGrowthTime = crop.harvestTime;
            const damageTime = crop.harvestTime + 60 * 60 * 1000; // Nếu quá 2 lần thời gian thu hoạch thì bị sâu

            if (elapsedTime < halfGrowthTime) {
                landGrid[index] = "🌱"; // Giai đoạn đầu
            } else if (elapsedTime < fullGrowthTime) {
                landGrid[index] = "🌿"; // Giai đoạn giữa
            } else if (elapsedTime < damageTime) {
                landGrid[index] = crops[crop.name].emoji; // Giai đoạn cuối
            } else {
                landGrid[index] = "🐛"; // Cây bị sâu
            }
        });

        let farmDisplay = "";
        for (let i = 0; i < landGrid.length; i += 10) {
            farmDisplay += landGrid.slice(i, i + 10).join(" ") + "\n";
        }

        message.reply(`🏡 **Trang trại của ${message.author.username}:**\n\n${farmDisplay}`);
    },
};
