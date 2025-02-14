const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Hiện trợ giúp về lệnh',
    execute: async (message) => {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({ name: `Danh sách lệnh`, iconURL: message.author.displayAvatarURL() })
            .setDescription("Dưới đây là danh sách lệnh của bot. Prefix của bot là `k`")
            .addFields(
                {
                    name: "💰 Tiền",
                    value: "``money`` ``rob`` ``crime`` ``work`` ``give``",
                    inline: false
                },
                {
                    name: "🎲 Mini games",
                    value: "``bc`` ``caro`` ``bigcaro`` ``bj`` ``duel`` ``guess`` ``slot`` ``treasure`` ``chess`` ``mine`` ``quiz`` ",
                    inline: false
                }
            );

        await message.reply({ embeds: [embed] });
    }
};
