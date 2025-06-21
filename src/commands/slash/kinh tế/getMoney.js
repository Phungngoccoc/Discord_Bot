const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../../model/userModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setName('getmoney')
        .setDescription('Nhận 100 triệu xu'),
    category: 'currency',

    async execute(interaction) {
        const userId = interaction.user.id;

        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId, money: 0 });
        }

        user.money += 100_000_000;
        await user.save();

        await interaction.reply('Bạn đã nhận được **100 triệu xu**!');
    },
};
