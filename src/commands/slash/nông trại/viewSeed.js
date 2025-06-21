const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { crops } = require('../../../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seed')
        .setDescription('Xem danh sách hạt giống có thể mua'),
    category: 'farm',

    async execute(interaction) {
        const seedList = Object.entries(crops)
            .map(([name, data]) =>
                `${data.emoji || '🌱'} **${name}** - 💰 Mua: ${data.buyPrice} | 🏪 Bán: ${data.sellPrice} | ⏳ Thu hoạch: ${Math.round(data.harvestTime / 1000 / 60)} phút`
            )
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('🌾 Danh Sách Hạt Giống')
            .setDescription('Bạn có thể mua các loại hạt giống sau:')
            .addFields({ name: '📦 Hạt giống', value: seedList })
            .setFooter({ text: 'Dùng lệnh /buyseed <tên> <số lượng> để mua hạt giống!' });

        return interaction.reply({ embeds: [embed] });
    }
};
