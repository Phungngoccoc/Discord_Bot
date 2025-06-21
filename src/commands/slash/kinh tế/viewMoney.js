const { SlashCommandBuilder } = require('discord.js');
const User = require('../../../model/userModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('money')
        .setDescription('Xem số xu của bạn hoặc của người khác')
        .addUserOption(option =>
            option.setName('nguoi_choi')
                .setDescription('Chọn người bạn muốn xem xu')
                .setRequired(false)
        ),
    category: 'currency',

    async execute(interaction) {
        const targetUser = interaction.options.getUser('nguoi_choi') || interaction.user;
        const targetId = targetUser.id;
        const targetUsername = targetUser.globalName || targetUser.username;

        try {
            let user = await User.findOne({ userId: targetId });

            if (!user) {
                user = new User({
                    userId: targetId,
                    money: 1000,
                    wins: 0,
                    losses: 0,
                    gameInProgress: false
                });
                await user.save();
            }

            await interaction.reply(`💵 **${targetUsername}** đang có **${user.money} xu**`);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu người dùng:', error);
            await interaction.reply('Đã xảy ra lỗi khi lấy số xu.');
        }
    }
};
