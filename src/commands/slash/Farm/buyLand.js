const { SlashCommandBuilder } = require('discord.js');
const User = require('../../../model/userModel');
const Farm = require('../../../model/farmModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buyland')
        .setDescription('Mua thêm ô đất để mở rộng nông trại')
        .addIntegerOption(option =>
            option.setName('so_o_dat')
                .setDescription('Số ô đất muốn mua (tối đa 100 ô)')
                .setRequired(true)
        ),
    category: 'farm',

    async execute(interaction) {
        const userId = interaction.user.id;
        const landToBuy = interaction.options.getInteger('so_o_dat');

        const user = await User.findOne({ userId });
        const farm = await Farm.findOne({ userId });

        if (!user || !farm) {
            return interaction.reply({
                content: 'Bạn chưa có trang trại! Dùng lệnh `/farm` để tạo nông trại mới.',
                flags: 64
            });
        }

        if (isNaN(landToBuy) || landToBuy <= 0) {
            return interaction.reply({ content: 'Vui lòng nhập số ô đất hợp lệ cần mua!', flags: 64 });
        }

        if (farm.landSlots + landToBuy > 100) {
            return interaction.reply({
                content: `Bạn không thể vượt quá 100 ô đất! Hiện tại bạn có **${farm.landSlots}** ô.`,
                flags: 64
            });
        }

        const totalCost = landToBuy * 100;

        if (user.money < totalCost) {
            return interaction.reply({
                content: `Bạn không đủ tiền! Cần **${totalCost}** xu để mua ${landToBuy} ô đất.`,
                flags: 64
            });
        }

        farm.landSlots += landToBuy;
        user.money -= totalCost;

        await farm.save();
        await user.save();

        return interaction.reply(`Bạn đã mua **${landToBuy}** ô đất! Tổng cộng: **${farm.landSlots}/100** ô.`);
    }
};
