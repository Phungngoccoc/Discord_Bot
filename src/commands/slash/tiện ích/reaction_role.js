const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChannelType,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reactionrole")
        .setDescription("Gửi message gán nhiều role bằng Select Menu")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Kênh muốn gửi tin nhắn")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option =>
            option
                .setName("roles")
                .setDescription("Danh sách role, cách nhau bởi dấu phẩy (VD: @Red,@Blue)")
                .setRequired(true)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");
        const rawRoles = interaction.options.getString("roles");

        const roleNames = rawRoles.split(",").map(r => r.trim().replace(/^@/, ""));
        const matchedRoles = roleNames
            .map(name => interaction.guild.roles.cache.find(role => role.name === name))
            .filter(role => !!role);

        if (matchedRoles.length === 0) {
            return interaction.reply({ content: "❌ Không tìm thấy role nào hợp lệ.", flags: 64 });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId("reaction_roles_select")
            .setPlaceholder("Chọn role bạn muốn nhận...")
            .setMinValues(0)
            .setMaxValues(matchedRoles.length)
            .addOptions(
                matchedRoles.map(role => ({
                    label: role.name,
                    value: role.id,
                }))
            );

        const row = new ActionRowBuilder().addComponents(select);

        await channel.send({
            content: "🎯 Chọn role bạn muốn gán/xoá:",
            components: [row],
        });

        await interaction.reply({ content: `Đã gửi Select Menu vào ${channel}`, flags: 64 });
    },
};
