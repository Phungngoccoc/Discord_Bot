const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogmessagechannel')
        .setDescription('📝 Cài đặt kênh dùng để log khi tin nhắn bị xóa')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: 'admin',

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const channelId = interaction.channel.id;

        try {
            let config = await GuildConfig.findOne({ guildId });

            if (!config) {
                config = new GuildConfig({
                    guildId,
                    wordGameChannelId: 'unset', // Hoặc null tùy vào logic tổng
                    logMessageChannelId: channelId
                });
            } else {
                config.logMessageChannelId = channelId;
            }

            await config.save();

            return interaction.reply(`Đã đặt kênh log tin nhắn bị xóa là <#${channelId}>`);
        } catch (error) {
            console.error('Lỗi khi cài đặt log message channel:', error);
            return interaction.reply({
                content: 'Đã xảy ra lỗi khi lưu cài đặt.',
                flags: 64
            });
        }
    }
};
