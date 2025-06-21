const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setboostembed')
        .setDescription('Thiết lập nội dung embed khi người dùng boost server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt =>
            opt.setName('title').setDescription('Tiêu đề').setRequired(true))
        .addStringOption(opt =>
            opt.setName('description').setDescription('Mô tả').setRequired(true))
        .addStringOption(opt =>
            opt.setName('color').setDescription('Màu (hex)').setRequired(true))
        .addStringOption(opt =>
            opt.setName('footer').setDescription('Chân trang (tuỳ chọn)').setRequired(false))
        .addStringOption(opt =>
            opt.setName('image').setDescription('URL ảnh/gif (tuỳ chọn)').setRequired(false)),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color');
        const footer = interaction.options.getString('footer') || null;
        const image = interaction.options.getString('image') || null;

        let config = await GuildConfig.findOne({ guildId });
        if (!config) config = new GuildConfig({ guildId });

        config.boostEmbed = {
            title,
            description,
            color,
            footer,
            image
        };

        await config.save();

        const preview = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

        if (footer) preview.setFooter({ text: footer });
        if (image) preview.setImage(image);

        await interaction.reply({
            content: '✅ Đã thiết lập embed boost. Đây là bản preview:',
            embeds: [preview]
        });
    }
};