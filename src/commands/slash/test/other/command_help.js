const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Hiện trợ giúp về các lệnh của bot'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({
                name: 'Danh sách lệnh',
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`Dưới đây là danh sách lệnh của bot. Prefix của bot là ${process.env.PREFIX}`)
            .addFields(
                {
                    name: "💰 Tiền",
                    value: "``money`` ``rob`` ``crime`` ``work`` ``give``",
                    inline: false
                },
                {
                    name: "🎲 Mini games",
                    value: "``bc`` ``caro`` ``bigcaro`` ``bj`` ``duel`` ``guess`` ``slot`` ``treasure`` ``chess`` ``mine`` ``quiz`` ``race`` ",
                    inline: false
                },
                {
                    name: "🚜 Nông trại",
                    value: "``farm`` ``buyland`` ``buyseed`` ``storage`` ``sell`` ``harvest`` ``seed``",
                    inline: false
                }
            );

        // await interaction.reply({ embeds: [embed], flags: 64 }); // ephemeral: chỉ người dùng thấy
        await interaction.reply({ embeds: [embed] });
    }
};
