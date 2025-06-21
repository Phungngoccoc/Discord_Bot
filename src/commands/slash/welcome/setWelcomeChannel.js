const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwelcomechannel')
        .setDescription('Thiết lập kênh chào mừng cho server')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Chọn kênh chào mừng')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const channel = interaction.options.getChannel('channel');

        let config = await GuildConfig.findOne({ guildId });

        if (!config) {
            config = new GuildConfig({ guildId });
        }

        config.welcomeChannelId = channel.id;
        await config.save();

        await interaction.reply(`✅ Đã thiết lập kênh chào mừng là ${channel}`);
    }
};
