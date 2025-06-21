const { SlashCommandBuilder } = require('discord.js');
const User = require('../../../model/userModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('Thử vận may với việc phạm tội (có thể mất tiền)'),
    category: 'currency',

    async execute(interaction) {
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldownTime = 6 * 60 * 60 * 1000; // 6 giờ

        try {
            let user = await User.findOne({ userId });
            if (!user) {
                user = new User({ userId, money: 1000, lastCrime: 0 });
            }

            if (now - user.lastCrime < cooldownTime) {
                const remainingTime = cooldownTime - (now - user.lastCrime);
                const hours = Math.floor(remainingTime / (60 * 60 * 1000));
                const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
                return interaction.reply(`Bạn cần đợi ${hours} giờ ${minutes} phút nữa để lên kế hoạch!`);
            }

            const chance = Math.random();
            const amount = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;

            if (chance < 0.5) {
                user.money += amount;
                await interaction.reply(`Bạn đi ăn trộm thành công và kiếm được **${amount}** xu!`);
            } else {
                user.money -= amount;
                await interaction.reply(`Bạn bị bắt và mất **${amount}** xu!`);
            }

            user.lastCrime = now;
            await user.save();
        } catch (error) {
            console.error('Lỗi khi xử lý crime:', error);
            await interaction.reply('Đã xảy ra lỗi khi thử vận may phạm tội.');
        }
    }
};