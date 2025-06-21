const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setName('previewwelcomeembed')
        .setDescription('Xem thử embed chào mừng hiện tại của server'),

    async execute(interaction) {
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });

        if (!config || !config.welcomeEmbed) {
            return interaction.reply({
                content: 'Chưa thiết lập embed chào mừng. Hãy dùng lệnh `/setwelcomeembed`.',
                flags: 64
            });
        }

        const { title, description, image, footer, color } = config.welcomeEmbed;

        const parsedTitle = title?.replace(/<@user>/g, `<@${interaction.user.id}>`) || '';
        const parsedDescription = description?.replace(/<@user>/g, `<@${interaction.user.id}>`) || '';

        const embed = new EmbedBuilder()
            .setTitle(parsedTitle)
            .setDescription(parsedDescription)
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            });

        // Xử lý màu
        try {
            if (color) embed.setColor(color);
        } catch {
            embed.setColor('#FFC0CB');
        }

        if (footer) {
            embed.setFooter({ text: footer });
        }

        const files = [];

        if (image) {
            const imagePath = path.join(__dirname, '../../../assets/welcome', image);
            if (fs.existsSync(imagePath)) {
                embed.setImage(`attachment://${image}`);
                files.push(new AttachmentBuilder(imagePath, { name: image }));
            } else {
                embed.setFooter({
                    text: 'Ảnh được chỉ định không tồn tại trên máy chủ.'
                });
            }
        }

        await interaction.reply({
            content: 'Đây là bản preview embed chào mừng:',
            embeds: [embed],
            files
        });
    }
};
