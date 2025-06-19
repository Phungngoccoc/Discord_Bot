const { SlashCommandBuilder } = require('discord.js');
const User = require('../../../model/userModel');
const Farm = require('../../../model/farmModel');
const { crops } = require('../../../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buyseed')
        .setDescription('Mua hạt giống để trồng trọt')
        .addStringOption(option =>
            option.setName('ten_hat')
                .setDescription('Tên hạt giống muốn mua (ví dụ: carrot, corn...)')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('so_luong')
                .setDescription('Số lượng hạt giống muốn mua (mặc định: 1)')
                .setRequired(false)
        ),
    category: 'farm',

    async execute(interaction) {
        const userId = interaction.user.id;
        const seedName = interaction.options.getString('ten_hat').toLowerCase();
        const quantity = interaction.options.getInteger('so_luong') || 1;

        const user = await User.findOne({ userId });
        const farm = await Farm.findOne({ userId });

        if (!user || !farm) {
            return interaction.reply({
                content: 'Bạn chưa có trang trại! Dùng lệnh `/farm` để tạo nông trại mới.',
                flags: 64
            });
        }

        if (!crops[seedName]) {
            return interaction.reply({
                content: `Hạt giống không hợp lệ! Các loại hợp lệ: **${Object.keys(crops).join(', ')}**.`,
                flags: 64
            });
        }

        const availableLand = farm.landSlots - farm.crops.length;

        if (quantity > availableLand) {
            return interaction.reply({
                content: `Bạn chỉ có **${availableLand}** ô đất trống, không thể mua **${quantity}** hạt giống!`,
                flags: 64
            });
        }

        const totalCost = crops[seedName].buyPrice * quantity;

        if (user.money < totalCost) {
            return interaction.reply({
                content: `Bạn không đủ tiền! Cần **${totalCost} xu**, nhưng bạn chỉ có **${user.money} xu**.`,
                flags: 64
            });
        }

        user.money -= totalCost;

        for (let i = 0; i < quantity; i++) {
            farm.crops.push({
                name: seedName,
                plantedAt: new Date(),
                harvestTime: crops[seedName].harvestTime,
                isHarvested: false,
                isDamaged: false,
                fertilizerUsed: false
            });
        }

        await user.save();
        await farm.save();

        return interaction.reply(`Bạn đã mua **${quantity}** hạt giống **${seedName}** với giá **${totalCost} xu**!`);
    }
};
