const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} = require("discord.js");
const User = require("../../../model/userModel");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mine")
        .setDescription("Đào mỏ khoáng sản để nhận xu!"),

    async execute(interaction) {
        const userId = interaction.user.id;

        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId, money: 0, lastMine: 0 });
            await user.save();
        }

        const now = Date.now();
        const cooldown = 30 * 60 * 1000;

        if (user.lastMine && now - user.lastMine < cooldown) {
            const remainingTime = Math.ceil((cooldown - (now - user.lastMine)) / 60000);
            return interaction.reply({
                content: `Bạn cần chờ **${remainingTime} phút** nữa để đào tiếp!`,
                flags: 64,
            });
        }

        user.lastMine = now;
        await user.save();

        const rewards = ["💎", "💰", "🏆", "🏆", "📜", "📜", "💀", "💀", "💀"];
        const values = [500, 200, 100, 100, 50, 50, -100, -100, -100];

        const shuffledRewards = rewards
            .map((item, index) => ({ item, value: values[index] }))
            .sort(() => Math.random() - 0.5);

        const buttons = shuffledRewards.map((_, index) =>
            new ButtonBuilder()
                .setCustomId(`mine_${index}`)
                .setLabel("⛏️")
                .setStyle(ButtonStyle.Secondary)
        );

        const rows = [
            new ActionRowBuilder().addComponents(buttons.slice(0, 3)),
            new ActionRowBuilder().addComponents(buttons.slice(3, 6)),
            new ActionRowBuilder().addComponents(buttons.slice(6, 9)),
        ];

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("⛏️ Mỏ khoáng sản")
            .setDescription("Chọn 1 trong 9 ô để đào!\nBạn có **3 lần** đào.");

        await interaction.reply({ embeds: [embed], components: rows, fetchReply: true });

        const msg = await interaction.fetchReply();
        let attempts = 3;

        const collector = msg.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", async (btn) => {
            if (btn.user.id !== userId) {
                return btn.reply({ content: "Bạn không phải người chơi!", flags: 64 });
            }

            if (attempts <= 0) {
                return btn.reply({ content: "Bạn đã hết lượt đào!", flags: 64 });
            }

            const index = parseInt(btn.customId.split("_")[1], 10);
            const { item, value } = shuffledRewards[index];

            user.money += value;
            if (user.money < 0) user.money = 0;
            await user.save();

            buttons[index].setLabel(item).setStyle(ButtonStyle.Primary).setDisabled(true);
            attempts--;

            embed.setDescription(
                `Bạn đào được **${item}** (${value} xu)\n\nLượt còn lại: **${attempts}**`
            );

            if (attempts === 0) {
                embed.addFields({
                    name: "Tổng xu của bạn:",
                    value: `${user.money} xu`,
                    inline: true,
                });
                collector.stop();
            }

            await btn.update({ embeds: [embed], components: rows });
        });

        collector.on("end", () => {
            msg.edit({ components: [] }).catch(() => { });
        });
    },
};
