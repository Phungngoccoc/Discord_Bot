const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    Events,
} = require('discord.js');
const { getUserData, updateUserData } = require('../../../service/userService');

let gameRunning = new Set(); // Hỗ trợ nhiều kênh cùng lúc

module.exports = {
    data: new SlashCommandBuilder()
        .setName('taixiu')
        .setDescription('Chơi Tài Xỉu! Đặt cược và chờ kết quả!'),

    async execute(interaction) {
        const channelId = interaction.channel.id;

        if (gameRunning.has(channelId)) {
            return interaction.reply({
                content: 'Hiện tại đang có một ván Tài Xỉu diễn ra trong kênh này!',
                flags: 64,
            });
        }

        gameRunning.add(channelId);

        const embed = new EmbedBuilder()
            .setColor('#ffcc00')
            .setTitle('🎲 Chơi Tài Xỉu 🎲')
            .setDescription('Nhấn nút để đặt cược **Tài** hoặc **Xỉu**! Bạn có **15 giây** để tham gia.')
            .setFooter({ text: 'Dưới 10 là Xỉu, từ 10 trở lên là Tài.' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('bet_tai').setLabel('Tài').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('bet_xiu').setLabel('Xỉu').setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
        const msg = await interaction.fetchReply();

        const bets = new Map();
        const userChoices = new Map();

        const collector = msg.createMessageComponentCollector({
            time: 15000,
            filter: (i) => ['bet_tai', 'bet_xiu'].includes(i.customId),
        });

        collector.on('collect', async (i) => {
            const userId = i.user.id;

            if (userChoices.has(userId)) {
                return i.reply({ content: 'Bạn đã đặt cược rồi!', flags: 64 });
            }

            const choice = i.customId === 'bet_tai' ? 'Tài' : 'Xỉu';
            userChoices.set(userId, choice);

            const modal = new ModalBuilder()
                .setCustomId(`modal_tx_${userId}`)
                .setTitle(`Đặt cược vào ${choice}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('bet_amount')
                            .setLabel('Nhập số tiền cược:')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                );

            await i.showModal(modal);
        });

        const modalHandler = async (modalInteraction) => {
            if (!modalInteraction.isModalSubmit()) return;
            if (!modalInteraction.customId.startsWith('modal_tx_')) return;

            const userId = modalInteraction.user.id;
            const choice = userChoices.get(userId);

            if (!choice) return;

            const betAmount = parseInt(modalInteraction.fields.getTextInputValue('bet_amount'));

            if (isNaN(betAmount) || betAmount <= 0) {
                return modalInteraction.reply({ content: 'Số tiền không hợp lệ!', flags: 64 });
            }

            const userData = await getUserData(userId);
            if (!userData || userData.money < betAmount) {
                return modalInteraction.reply({ content: 'Bạn không đủ tiền!', flags: 64 });
            }

            bets.set(userId, { choice, amount: betAmount });
            await modalInteraction.reply({
                content: `Bạn đã đặt cược **${betAmount} xu** vào **${choice}**!`,
                flags: 64,
            });
        };

        interaction.client.on(Events.InteractionCreate, modalHandler);

        collector.on('end', async () => {
            const rollingEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('🎲 Tung xúc xắc...')
                .setDescription('<a:rolling:1228414116725653634> <a:rolling:1228414116725653634> <a:rolling:1228414116725653634>');

            const rollingMsg = await interaction.channel.send({ embeds: [rollingEmbed] });
            await new Promise((r) => setTimeout(r, 3000));

            const dice = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);
            const total = dice.reduce((a, b) => a + b);
            const result = total >= 10 ? 'Tài' : 'Xỉu';

            const emoji = ['<:tx1:1339511294453354530>', '<:tx2:1339511297338769448>', '<:tx3:1339511299368816640>', '<:tx4:1339511301617094657>', '<:tx5:1339511305723318313>', '<:tx6:1339511308554600508>'];
            const diceDisplay = dice.map(d => emoji[d - 1]).join(' ');

            const resultEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('🎲 Kết quả tung xúc xắc')
                .setDescription(`${diceDisplay}\n\nTổng: **${total}**\n➡️ Kết quả: **${result}**`);

            await rollingMsg.edit({ embeds: [resultEmbed] });

            let summary = '';
            for (const [userId, bet] of bets.entries()) {
                const user = await getUserData(userId);
                if (!user) continue;

                const won = bet.choice === result;
                const change = won ? bet.amount : -bet.amount;
                await updateUserData(userId, { money: user.money + change });

                summary += `<@${userId}> ${won ? 'thắng' : 'thua'} **${Math.abs(change)} xu**\n`;
            }

            if (summary) await interaction.channel.send(summary);

            gameRunning.delete(channelId);
            interaction.client.removeListener(Events.InteractionCreate, modalHandler);
        });
    },
};
