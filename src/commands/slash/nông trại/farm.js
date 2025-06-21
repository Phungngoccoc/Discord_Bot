const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Farm = require('../../../model/farmModel');
const { crops } = require('../../../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('farm')
        .setDescription('Xem trang trại của bạn')
        .addStringOption(option =>
            option.setName('tùy_chọn')
                .setDescription('Nhập "help" để xem hướng dẫn')),

    async execute(interaction) {
        const userId = interaction.user.id;
        const option = interaction.options.getString('tùy_chọn');

        let farm = await Farm.findOne({ userId });
        if (!farm) {
            farm = new Farm({
                userId,
                landSlots: 10,
                crops: Array(10).fill(null)
            });
            await farm.save();
        }

        if (option === 'help') {
            const helpEmbed = new EmbedBuilder()
                .setColor("#4CAF50")
                .setTitle("📜 Hướng dẫn chơi nông trại")
                .setDescription("Các lệnh cơ bản để quản lý trang trại của bạn.")
                .addFields(
                    { name: "🌱 Mua đất", value: "`/buyland` - Mua thêm đất để trồng trọt.", inline: true },
                    { name: "🌾 Mua giống", value: "`/buyseed` - Mua hạt giống và trồng ngay.", inline: true },
                    { name: "🌾 Xem giống", value: "`/seed` - Danh sách giống có sẵn.", inline: true },
                    { name: "⏳ Thu hoạch", value: "`/harvest` - Thu hoạch cây đã chín.", inline: true },
                    { name: "💰 Bán nông sản", value: "`/sell` - Bán sản phẩm để kiếm xu.", inline: true },
                    { name: "📦 Xem kho", value: "`/storage` - Xem kho chứa nông sản.", inline: true },
                    { name: "🏡 Xem trang trại", value: "`/farm` - Hiển thị trang trại của bạn.", inline: true }
                )
                .setFooter({ text: "Chúc bạn vui vẻ với trang trại của mình! 🌻" });

            return interaction.reply({ embeds: [helpEmbed] });
        }

        let landGrid = Array(farm.landSlots).fill("🟫");
        let cropCount = {};
        const currentTime = Date.now();

        farm.crops.forEach((crop, index) => {
            if (!crop) return;

            const elapsedTime = currentTime - new Date(crop.plantedAt).getTime();
            const halfGrowthTime = crops[crop.name].harvestTime / 2;
            const fullGrowthTime = crops[crop.name].harvestTime;
            const damageTime = fullGrowthTime + 60 * 60 * 1000;

            let timeLeft = fullGrowthTime - elapsedTime;
            let status = `🌱 Đang phát triển...`;

            if (elapsedTime < halfGrowthTime) {
                landGrid[index] = "🌱";
            } else if (elapsedTime < fullGrowthTime) {
                landGrid[index] = "🌿";
            } else if (elapsedTime < damageTime) {
                landGrid[index] = crops[crop.name].emoji;
                status = "Có thể thu hoạch ngay!";
            } else {
                landGrid[index] = "🐛";
                status = "Bị sâu!";
            }

            if (elapsedTime >= fullGrowthTime) timeLeft = 0;
            else timeLeft = Math.ceil(timeLeft / (60 * 1000));

            const key = `${crops[crop.name].emoji} **${crop.name}** - ${status} ${timeLeft > 0 ? `(${timeLeft} phút còn lại)` : ""}`;
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
            .setTitle(`🏡 Trang trại của ${interaction.user.username}`)
            .setDescription(farmDisplay)
            .addFields(farmInfo)
            .setFooter({ text: "Dùng lệnh /harvest để thu hoạch cây trồng đã chín!" });

        await interaction.reply({ embeds: [farmEmbed] });
    }
};
