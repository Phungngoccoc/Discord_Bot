const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setboostchannel')
        .setDescription('Thiết lập kênh thông báo boost server')
        .addChannelOption(option =>
            option.setName('channel').setDescription('Chọn kênh boost').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const channel = interaction.options.getChannel('channel');

        let config = await GuildConfig.findOne({ guildId });
        if (!config) config = new GuildConfig({ guildId });

        config.boostChannelId = channel.id;
        await config.save();

        await interaction.reply(`✅ Đã thiết lập kênh boost là ${channel}`);
    }
};