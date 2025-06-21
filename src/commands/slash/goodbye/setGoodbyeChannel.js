const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setgoodbyechannel')
        .setDescription('Thiết lập kênh từ biệt cho server')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Chọn kênh từ biệt')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const channel = interaction.options.getChannel('channel');

        let config = await GuildConfig.findOne({ guildId });
        if (!config) config = new GuildConfig({ guildId });

        config.goodbyeChannelId = channel.id;
        await config.save();

        await interaction.reply(`Đã thiết lập kênh tạm biệt là ${channel}`);
    }
};