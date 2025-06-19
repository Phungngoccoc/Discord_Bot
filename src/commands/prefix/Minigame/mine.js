const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const User = require("../../../model/userModel");

module.exports = {
    name: "mine",
    execute: async (message) => {
        const userId = message.author.id;

        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId, money: 0, lastMine: 0 });
            await user.save();
        }

        const now = Date.now();
        const cooldown = 30 * 60 * 1000;

        if (user.lastMine && now - user.lastMine < cooldown) {
            const remainingTime = Math.ceil((cooldown - (now - user.lastMine)) / 60000);
            return message.reply(`Bạn phải chờ ${remainingTime} phút nữa mới có thể đào tiếp!`); a
        }

        user.lastMine = now;
        await user.save();

        const rewards = ["💎", "💰", "🏆", "🏆", "📜", "📜", "💀", "💀", "💀"];
        const values = [500, 200, 100, 100, 50, 50, -100, -100, -100];

        const shuffledRewards = rewards.map((item, index) => ({ item, value: values[index] }))
            .sort(() => Math.random() - 0.5);

        const buttons = shuffledRewards.map((_, index) => new ButtonBuilder()
            .setCustomId(`mine_${index}`)
            .setLabel("⛏️")
            .setStyle(ButtonStyle.Secondary));

        const rows = [
            new ActionRowBuilder().addComponents(buttons.slice(0, 3)),
            new ActionRowBuilder().addComponents(buttons.slice(3, 6)),
            new ActionRowBuilder().addComponents(buttons.slice(6, 9)),
        ];

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("⛏️ Mỏ khoáng sản")
            .setDescription("Chọn 1 trong 9 ô để đào!\nBạn có **3 lần** đào.")

        const msg = await message.channel.send({ embeds: [embed], components: rows });

        let attempts = 3;

        const collector = msg.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== userId) {
                return interaction.reply({ content: "Bạn không phải người chơi!", flags: 64 });
            }

            if (attempts <= 0) {
                return interaction.reply({ content: "Bạn đã hết lượt đào!", flags: 64 });
            }

            const index = parseInt(interaction.customId.split("_")[1], 10);
            const { item, value } = shuffledRewards[index];

            user.money += value;
            if (user.money < 0) user.money = 0;
            await user.save();

            buttons[index].setLabel(item).setStyle(ButtonStyle.Primary).setDisabled(true);

            attempts--;

            embed.setDescription(`Bạn đào được **${item}** (${value} xu)\n\nLượt còn lại: **${attempts}**`);
            if (attempts === 0) {
                embed.addFields({ name: "💰 Tổng xu của bạn:", value: `${user.money} xu`, inline: true });
                collector.stop();
            }

            await interaction.update({ embeds: [embed], components: rows });
        });

        collector.on("end", () => {
            msg.edit({ components: [] });
        });
    },
};
