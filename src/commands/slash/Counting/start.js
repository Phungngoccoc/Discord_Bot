const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');
const countingGameManager = require('../../../utils/countingGameManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startcounting')
        .setDescription('Bắt đầu trò chơi Counting trong kênh hiện tại'),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const channelId = interaction.channel.id;

        // Tìm hoặc tạo cấu hình Guild
        let config = await GuildConfig.findOne({ guildId });
        if (!config) {
            config = new GuildConfig({ guildId });
        }

        config.countingChannelId = channelId;
        await config.save();

        // Khởi tạo trò chơi Counting
        countingGameManager.startCounting(channelId);

        await interaction.reply({
            content: `Counting bắt đầu!`,
        });
    }
};
