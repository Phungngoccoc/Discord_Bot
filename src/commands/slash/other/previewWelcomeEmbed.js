const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('previewwelcomeembed')
        .setDescription('Xem thử embed chào mừng hiện tại của server'),

    async execute(interaction) {
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!config || !config.welcomeEmbed) {
            return interaction.reply({
                content: '⚠️ Chưa thiết lập embed chào mừng. Hãy dùng lệnh `/setwelcomeembed`.',
                ephemeral: true
            });
        }

        const { title, description, image, footer, color } = config.welcomeEmbed;

        // Thay thế <@user> trong title/desc bằng user thật
        const parsedTitle = title?.replace(/<@user>/g, `<@${interaction.user.id}>`) || '';
        const parsedDescription = description?.replace(/<@user>/g, `<@${interaction.user.id}>`) || '';

        const embed = new EmbedBuilder()
            .setTitle(parsedTitle)
            .setDescription(parsedDescription)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })

        // Xử lý màu
        try {
            if (color) embed.setColor(color);
        } catch (err) {
            embed.setColor('#FFC0CB'); // fallback nếu màu lỗi
        }

        if (footer) embed.setFooter({ text: footer });
        if (image) embed.setImage(image);

        await interaction.reply({
            content: '📢 Đây là bản preview embed chào mừng:',
            embeds: [embed],
        });
    }
};
