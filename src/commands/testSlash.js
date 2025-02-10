const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Kiểm tra bot có nhận lệnh Slash Command hay không!'),
    async execute(interaction) {
        console.log(`[DEBUG] Bot nhận được lệnh: /test từ ${interaction.user.tag}`);

        await interaction.reply({
            content: '✅ Bot đang hoạt động bình thường!'
        });
    },
};
