const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');
const wordGameManager = require('../../../utils/wordGameManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Bắt đầu game nối từ trong kênh đã thiết lập'),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const channelId = interaction.channel.id;

        const config = await GuildConfig.findOne({ guildId });
        if (!config || config.wordGameChannelId !== channelId) {
            return interaction.reply({ content: 'Kênh này không phải kênh nối từ đã được thiết lập.', flags: 64 });
        }

        wordGameManager.startGame(channelId);
        await interaction.reply('Trò chơi nối từ đã bắt đầu! Hãy nhập từ đầu tiên.');
    }
};
