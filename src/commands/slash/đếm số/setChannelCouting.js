// commands/slash/counting/setCountingChannel.js
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcountingchannel')
        .setDescription('Thiết lập kênh chơi game đếm số (counting)')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Chọn kênh để chơi counting')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const channel = interaction.options.getChannel('channel');

        let config = await GuildConfig.findOne({ guildId });
        if (!config) {
            config = new GuildConfig({ guildId });
        }

        config.countingChannelId = channel.id;
        await config.save();

        await interaction.reply(`✅ Đã thiết lập kênh counting là <#${channel.id}>.`);
    }
};
