const { SlashCommandBuilder } = require('discord.js');
const User = require('../../../model/userModel');
const { crops } = require('../../../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Bán tất cả nông sản đã thu hoạch để kiếm xu'),
    category: 'farm',

    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findOne({ userId });

        if (!user || !user.storage || Object.keys(user.storage).length === 0) {
            return interaction.reply({
                content: 'Bạn không có nông sản nào để bán!',
                flags: 64
            });
        }

        // Xử lý storage: từ object → entries
        const storageEntries = Object.entries(user.storage);
        let totalEarnings = 0;
        let sellDetails = [];

        for (const [crop, quantity] of storageEntries) {
            if (crops[crop] && quantity > 0) {
                const earnings = crops[crop].sellPrice * quantity;
                totalEarnings += earnings;

                sellDetails.push(`**${crop}**: ${quantity} cây → 💵 **+${earnings} xu**`);
                delete user.storage[crop]; // Xóa khỏi kho sau khi bán
            }
        }

        if (totalEarnings === 0) {
            return interaction.reply('Bạn không có nông sản hợp lệ để bán!');
        }

        user.money += totalEarnings;
        await user.save();

        return interaction.reply(
            `**Bán nông sản thành công!**\n${sellDetails.join('\n')}\n\n💰 **Tổng tiền nhận được: ${totalEarnings} xu**`
        );
    }
};
