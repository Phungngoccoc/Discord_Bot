const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwelcomeembed')
        .setDescription('Thiết lập embed chào mừng thành viên mới')
        .addStringOption(opt =>
            opt.setName('title').setDescription('Tiêu đề').setRequired(true))
        .addStringOption(opt =>
            opt.setName('color').setDescription('Màu (hex hoặc tên màu)').setRequired(true))
        .addStringOption(opt =>
            opt.setName('description').setDescription('Nội dung (dùng \\n để xuống dòng)').setRequired(true))
        .addStringOption(opt =>
            opt.setName('footer').setDescription('Chân trang (tuỳ chọn, dùng \\n để xuống dòng)').setRequired(false))
        .addAttachmentOption(opt =>
            opt.setName('image').setDescription('Ảnh hoặc gif chào mừng (tuỳ chọn)').setRequired(false)),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const title = interaction.options.getString('title');
        const color = interaction.options.getString('color');
        const description = interaction.options.getString('description');
        const footer = interaction.options.getString('footer') || null;
        const attachment = interaction.options.getAttachment('image');

        const parsedDescription = description.replace(/\\n/g, '\n');
        const parsedFooter = footer ? footer.replace(/\\n/g, '\n') : null;
        const image = attachment ? attachment.url : null;

        let config = await GuildConfig.findOne({ guildId });
        if (!config) {
            config = new GuildConfig({ guildId });
        }

        config.welcomeEmbed = {
            title,
            description: parsedDescription,
            image,
            footer: parsedFooter,
            color
        };

        await config.save();

        const previewEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setColor(color || '#ffffff')
            .setTitle(title)
            .setDescription(parsedDescription);

        if (image) previewEmbed.setImage(image);
        if (parsedFooter) previewEmbed.setFooter({ text: parsedFooter });

        await interaction.reply({
            content: '✅ Đã lưu embed chào mừng. Đây là bản preview:',
            embeds: [previewEmbed]
        });
    }
};
