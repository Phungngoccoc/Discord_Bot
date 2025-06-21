const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Xem avatar của một người dùng')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Người dùng cần xem avatar')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setColor(0x00bfff)
            .setTitle(`Avatar của ${user.tag}`)
            .setImage(avatarURL)
            .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        await interaction.reply({ embeds: [embed] });
    }
};