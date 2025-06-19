const { SlashCommandBuilder } = require('discord.js');
const User = require('../../../model/userModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('🛠️ Kiếm xu mỗi 6 giờ!'),
    category: 'currency',

    async execute(interaction) {
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldown = 6 * 60 * 60 * 1000; // 6 giờ
        const reward = Math.floor(Math.random() * (500 - 200 + 1)) + 200;

        try {
            let user = await User.findOne({ userId });

            if (!user) {
                user = new User({
                    userId,
                    money: 1000,
                    wins: 0,
                    losses: 0,
                    gameInProgress: false,
                    lastWorked: 0
                });
            }

            if (user.lastWorked && now - user.lastWorked < cooldown) {
                const remaining = cooldown - (now - user.lastWorked);
                const hours = Math.floor(remaining / (60 * 60 * 1000));
                const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                return interaction.reply(`🕒 Bạn cần nghỉ ${hours} giờ ${minutes} phút nữa để làm việc tiếp.`);
            }

            user.money += reward;
            user.lastWorked = now;
            await user.save();

            await interaction.reply(`💼 Bạn đã đi làm và nhận được **${reward} xu**! Tổng: **${user.money} xu**.`);
        } catch (error) {
            console.error('Lỗi khi cập nhật tiền:', error);
            await interaction.reply('⚠️ Đã xảy ra lỗi khi nhận tiền làm việc.');
        }
    }
};
