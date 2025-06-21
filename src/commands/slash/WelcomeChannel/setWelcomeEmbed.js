const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setName('setwelcomeembed')
        .setDescription('Thiết lập embed chào mừng thành viên mới')
        .addStringOption(opt => opt.setName('title').setDescription('Tiêu đề').setRequired(true))
        .addStringOption(opt => opt.setName('color').setDescription('Màu (hex hoặc tên màu)').setRequired(true))
        .addStringOption(opt => opt.setName('description').setDescription('Nội dung (\\n = xuống dòng)').setRequired(true))
        .addStringOption(opt => opt.setName('footer').setDescription('Chân trang (\\n = xuống dòng)').setRequired(false))
        .addAttachmentOption(opt => opt.setName('image').setDescription('Ảnh/gif chào mừng').setRequired(false)),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const title = interaction.options.getString('title');
        const color = interaction.options.getString('color');
        const description = interaction.options.getString('description').replace(/\\n/g, '\n');
        const footer = interaction.options.getString('footer')?.replace(/\\n/g, '\n') || null;
        const image = interaction.options.getAttachment('image');

        let imageFilename = null;

        // Lưu file ảnh vào thư mục assets nếu có ảnh
        if (image) {
            const ext = path.extname(image.name);
            imageFilename = `welcome_${guildId}${ext}`;
            const imagePath = path.join(__dirname, '../../../assets/welcome', imageFilename);

            const response = await fetch(image.url);
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(imagePath, Buffer.from(buffer));
        }

        let config = await GuildConfig.findOne({ guildId }) || new GuildConfig({ guildId });

        config.welcomeEmbed = {
            title,
            description,
            image: imageFilename, // lưu tên file vào field `image`
            footer,
            color
        };

        await config.save();

        // Tạo Embed preview
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);

        if (footer) embed.setFooter({ text: footer });

        const files = [];

        if (imageFilename) {
            const filePath = path.join(__dirname, '../../../assets/welcome', imageFilename);
            embed.setImage(`attachment://${imageFilename}`);
            files.push(new AttachmentBuilder(filePath, { name: imageFilename }));
        }

        await interaction.reply({
            content: 'Đã lưu embed chào mừng. Đây là bản preview:',
            embeds: [embed],
            files
        });
    }
};
