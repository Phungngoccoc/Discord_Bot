const { SlashCommandBuilder } = require('discord.js');
const User = require('../../../model/userModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('🦹‍♂️ Cướp tiền từ người khác (thất bại thì mất gấp đôi)')
        .addUserOption(option =>
            option.setName('nguoi_bi_cuop')
                .setDescription('Chọn người bạn muốn cướp')
                .setRequired(true)
        ),
    category: 'currency',

    async execute(interaction) {
        const userId = interaction.user.id;
        const targetUser = interaction.options.getUser('nguoi_bi_cuop');
        const targetId = targetUser.id;

        if (userId === targetId) {
            return interaction.reply({ content: '❌ Bạn không thể cướp chính mình!', ephemeral: true });
        }

        try {
            let user = await User.findOne({ userId });
            let target = await User.findOne({ userId: targetId });

            if (!user || !target) {
                return interaction.reply({ content: '❌ Người chơi chưa tồn tại trong hệ thống!', ephemeral: true });
            }

            const now = Date.now();
            const cooldownTime = 12 * 60 * 60 * 1000; // 12 giờ

            if (now - user.lastRob < cooldownTime) {
                const remaining = cooldownTime - (now - user.lastRob);
                const hours = Math.floor(remaining / (60 * 60 * 1000));
                const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                return interaction.reply(`🕒 Bạn cần đợi ${hours} giờ ${minutes} phút nữa để lên kế hoạch cướp tiếp.`);
            }

            const chance = Math.random(); // 50%
            const amount = Math.floor(Math.random() * (500 - 200 + 1)) + 200;

            if (chance < 0.5) {
                // Thành công
                if (target.money >= amount) {
                    user.money += amount;
                    target.money -= amount;
                    await interaction.reply(`✅ Bạn đã cướp thành công **${amount} xu** từ <@${targetId}>!`);
                } else {
                    user.money += target.money;
                    await interaction.reply(`✅ Bạn đã cướp thành công **${target.money} xu** từ <@${targetId}>, vì họ không có đủ tiền!`);
                    target.money = 0;
                }
            } else {
                // Thất bại
                const penalty = amount * 2;
                if (user.money >= penalty) {
                    user.money -= penalty;
                    await interaction.reply(`🚓 Bạn bị bắt và mất **${penalty} xu** do thất bại khi đi cướp!`);
                } else {
                    user.money = 0;
                    await interaction.reply(`🚓 Bạn bị bắt và mất toàn bộ số tiền hiện có vì không đủ **${penalty} xu** để nộp phạt!`);
                }
            }

            user.lastRob = now;
            await user.save();
            await target.save();
        } catch (error) {
            console.error('Lỗi khi xử lý rob:', error);
            await interaction.reply('⚠️ Đã xảy ra lỗi khi thực hiện cướp tiền.');
        }
    }
};
