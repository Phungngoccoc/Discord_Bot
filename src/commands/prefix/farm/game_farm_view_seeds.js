const { EmbedBuilder } = require("discord.js");
const { crops } = require("../../../utils/constants");

module.exports = {
    name: "seed",
    description: "Xem danh sách hạt giống có thể mua.",
    execute: async (message, args) => {
        let seedList = Object.entries(crops)
            .map(([name, data]) => `${data.emoji} **${name}** - 💰 Mua: ${data.buyPrice} | 🏪 Bán: ${data.sellPrice} | ⏳ Thu hoạch: ${data.harvestTime / 1000 / 60} phút`)
            .join("\n");

        const seedEmbed = new EmbedBuilder()
            .setColor("#FFA500")
            .setTitle("🌱 Danh Sách Hạt Giống")
            .setDescription("Dưới đây là các loại hạt giống bạn có thể mua:")
            .addFields({ name: "📦 Hạt giống", value: seedList })
            .setFooter({ text: "Dùng lệnh `kbuyseed <tên> <số lượng>` để mua hạt giống!" });

        message.reply({ embeds: [seedEmbed] });
    },
};
