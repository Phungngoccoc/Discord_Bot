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
        let cropCount = {}; // Để nhóm cây trồng theo loại và trạng thái
        const currentTime = Date.now();

        farm.crops.forEach((crop, index) => {
            if (!crop) return;

            const elapsedTime = currentTime - new Date(crop.plantedAt).getTime();
            const halfGrowthTime = crops[crop.name].harvestTime / 2;
            const fullGrowthTime = crops[crop.name].harvestTime;
            const damageTime = fullGrowthTime + 60 * 60 * 1000; // Nếu quá 1 tiếng sau khi trưởng thành thì bị sâu

            let timeLeft = fullGrowthTime - elapsedTime;
            let status = `🌱 Đang phát triển...`;

            if (elapsedTime < halfGrowthTime) {
                landGrid[index] = "🌱"; // Giai đoạn đầu
            } else if (elapsedTime < fullGrowthTime) {
                landGrid[index] = "🌿"; // Giai đoạn giữa
            } else if (elapsedTime < damageTime) {
                landGrid[index] = crops[crop.name].emoji; // Giai đoạn cuối
                status = "✅ Có thể thu hoạch ngay!";
            } else {
                landGrid[index] = "🐛"; // Cây bị sâu
                status = "❌ Bị sâu!";
            }

            if (elapsedTime >= fullGrowthTime) timeLeft = 0;
            else timeLeft = Math.ceil(timeLeft / (60 * 1000)); // Chuyển thành phút

            const key = `${crops[crop.name].emoji} **${crop.name}** - ${status} (${timeLeft > 0 ? `${timeLeft} phút` : ""})`;
            if (!cropCount[key]) cropCount[key] = 0;
            cropCount[key]++;
        });

        let farmDisplay = "";
        for (let i = 0; i < landGrid.length; i += 10) {
            farmDisplay += landGrid.slice(i, i + 10).join(" ") + "\n";
        }

        let farmInfo = Object.entries(cropCount).map(([info, count]) => ({
            name: " ",
            value: `${info} x${count}`,
            inline: false
        }));

        if (farmInfo.length === 0) {
            farmInfo.push({ name: " ", value: "Không có cây nào được trồng!" });
        }

        const farmEmbed = new EmbedBuilder()
            .setColor("#FFA500")
            .setTitle(`🏡 Trang trại của ${message.author.username}`)
            .setDescription(farmDisplay)
            .addFields(farmInfo)
            .setFooter({ text: "Dùng lệnh kharvest để thu hoạch cây trồng đã chín!" });

        message.reply({ embeds: [farmEmbed] });
    },
};
