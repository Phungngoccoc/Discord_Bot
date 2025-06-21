const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setName('setgoodbyeembed')
        .setDescription('Thiết lập embed từ biệt')
        .addStringOption(opt => opt.setName('title').setDescription('Tiêu đề').setRequired(true))
        .addStringOption(opt => opt.setName('color').setDescription('Màu (hex hoặc tên màu)').setRequired(true))
        .addStringOption(opt => opt.setName('description').setDescription('Nội dung (\n = xuống dòng)').setRequired(true))
        .addStringOption(opt => opt.setName('footer').setDescription('Chân trang (tuùy chọn)').setRequired(false))
        .addAttachmentOption(opt => opt.setName('image').setDescription('Ảnh hoặc gif (tuùy chọn)').setRequired(false)),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const title = interaction.options.getString('title');
        const color = interaction.options.getString('color');
        const description = interaction.options.getString('description').replace(/\n/g, '\n');
        const footer = interaction.options.getString('footer')?.replace(/\n/g, '\n') || null;
        const image = interaction.options.getAttachment('image');

        let imageFilename = null;

        if (image) {
            const ext = path.extname(image.name);
            imageFilename = `goodbye_${guildId}${ext}`;
            const imagePath = path.join(__dirname, '../../../assets/goodbye', imageFilename);
            const response = await fetch(image.url);
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(imagePath, Buffer.from(buffer));
        }

        let config = await GuildConfig.findOne({ guildId }) || new GuildConfig({ guildId });

        config.goodbyeEmbed = {
            title,
            description,
            image: imageFilename,
            footer,
            color
        };

        await config.save();

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setThumbnail(interaction.user.displayAvatarURL({ extension: 'png', size: 512 }))
            .setColor(color);
        const now = moment().tz('Asia/Ho_Chi_Minh');
        const memberCount = interaction.guild.memberCount;
        const footerText = `Server của chúng ta còn ${memberCount} members • Hôm nay lúc ${now.format('h:mm A')}`;
        embed.setFooter({ text: footerText });
        if (footer) embed.setFooter({ text: footer });
        if (imageFilename) {
            const filePath = path.join(__dirname, '../../../assets/goodbye', imageFilename);
            embed.setImage(`attachment://${imageFilename}`);
            return interaction.reply({
                content: 'Đã lưu embed tạm biệt. Dưới đây là bản xem trước:',
                embeds: [embed],
                files: [new AttachmentBuilder(filePath, { name: imageFilename })]
            });
        }

        await interaction.reply({
            content: '✅ Đã lưu embed từ biệt. Dưới đây là bản xem trước:',
            embeds: [embed]
        });
    }
};