const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupchannel')
        .setDescription('Thiết lập kênh hiện tại làm kênh chơi game nối từ'),

    async execute(interaction) {
        try {
            const guildId = interaction.guildId;
            const channelId = interaction.channel.id;

            await GuildConfig.findOneAndUpdate(
                { guildId },
                { guildId, wordGameChannelId: channelId },
                { upsert: true, new: true }
            );

            await interaction.reply(`Kênh **<#${channelId}>** đã được thiết lập làm kênh chơi game nối từ.`);
        } catch (error) {
            console.error('Lỗi khi setup channel:', error);
            await interaction.reply({ content: 'Có lỗi xảy ra khi thiết lập.', flags: 64 });
        }
    }
};
