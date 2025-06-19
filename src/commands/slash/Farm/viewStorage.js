const { SlashCommandBuilder } = require('discord.js');
const { crops } = require('../../../utils/constants');
const User = require('../../../model/userModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('storage')
        .setDescription('Kiểm tra số lượng nông sản trong kho'),
    category: 'farm',

    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findOne({ userId });

        if (!user) {
            return interaction.reply({
                content: 'Bạn chưa có trang trại! Dùng lệnh `/farm` để tạo nông trại mới.',
                flags: 64
            });
        }

        const storage = user.storage || {};
        const entries = Object.entries(storage).filter(([_, quantity]) => quantity > 0);

        if (entries.length === 0) {
            return interaction.reply('📭 Kho của bạn đang trống. Hãy thu hoạch để có nông sản!');
        }

        let content = '📦 **Kho nông sản của bạn:**\n';
        content += entries.map(([crop, quantity]) => {
            const emoji = crops[crop]?.emoji || '🌱';
            return `${emoji} **${crop}**: ${quantity}`;
        }).join('\n');

        return interaction.reply(content);
    }
};
