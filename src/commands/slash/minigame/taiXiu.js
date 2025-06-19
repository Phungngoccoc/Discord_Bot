const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Events,
} = require('discord.js');
const { getUserData, updateUserData } = require('../../../service/userService');

let gameRunning = new Set(); // hỗ trợ nhiều kênh chơi song song

module.exports = {
    name: 'tx',
    description: 'Chơi Tài Xỉu bằng cách đặt cược!',

    async execute(message) {
        const channelId = message.channel.id;

        if (gameRunning.has(channelId)) {
            return message.reply('⚠️ Ván Tài Xỉu đang diễn ra trong kênh này. Vui lòng chờ kết thúc!');
        }

        gameRunning.add(channelId);

        const embed = new EmbedBuilder()
            .setColor('#ffcc00')
            .setTitle('🎲 Chơi Tài Xỉu 🎲')
            .setDescription('Nhấn nút để đặt cược **Tài** hoặc **Xỉu**! Bạn có **15 giây**.')
            .setFooter({ text: 'Dưới 10 là Xỉu, từ 10 trở lên là Tài.' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('bet_tai').setLabel('Tài').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('bet_xiu').setLabel('Xỉu').setStyle(ButtonStyle.Danger)
        );

        const msg = await message.channel.send({ embeds: [embed], components: [row] });

        const bets = new Map(); // userId -> { choice, amount }
        const userChoices = new Map(); // userId -> Tài | Xỉu

        const collector = msg.createMessageComponentCollector({
            time: 15000,
            filter: (i) => ['bet_tai', 'bet_xiu'].includes(i.customId),
        });

        collector.on('collect', async (i) => {
            const userId = i.user.id;
            if (userChoices.has(userId)) {
                return i.reply({ content: '⚠️ Bạn đã đặt rồi!', ephemeral: true });
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

        const modalCollector = message.client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isModalSubmit()) return;
            if (!interaction.customId.startsWith('modal_tx_')) return;

            const userId = interaction.user.id;
            const betAmount = parseInt(interaction.fields.getTextInputValue('bet_amount'));
            const choice = userChoices.get(userId);

            if (!choice || isNaN(betAmount) || betAmount <= 0) {
                return interaction.reply({ content: '⚠️ Dữ liệu không hợp lệ!', ephemeral: true });
            }

            const userData = await getUserData(userId);
            if (!userData || userData.money < betAmount) {
                return interaction.reply({ content: '💸 Bạn không đủ tiền!', ephemeral: true });
            }

            bets.set(userId, { choice, amount: betAmount });
            await interaction.reply({ content: `✅ Bạn đã cược **${betAmount}** vào **${choice}**`, ephemeral: true });
        });

        collector.on('end', async () => {
            // Bắt đầu tung xúc xắc
            const loadingEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('🎲 Tung xúc xắc...')
                .setDescription('<a:rolling:1228414116725653634> <a:rolling:1228414116725653634> <a:rolling:1228414116725653634>');

            const rollingMsg = await message.channel.send({ embeds: [loadingEmbed] });
            await new Promise((r) => setTimeout(r, 3000));

            const dice = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);
            const total = dice.reduce((a, b) => a + b);
            const result = total >= 10 ? 'Tài' : 'Xỉu';

            const emoji = ['<:tx1:1339511294453354530>', '<:tx2:1339511297338769448>', '<:tx3:1339511299368816640>', '<:tx4:1339511301617094657>', '<:tx5:1339511305723318313>', '<:tx6:1339511308554600508>'];
            const diceDisplay = dice.map((d) => emoji[d - 1]).join(' ');

            const resultEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('🎲 Kết quả:')
                .setDescription(`${diceDisplay}\n\nTổng: **${total}**\n➡️ Kết quả: **${result}**`);

            await rollingMsg.edit({ embeds: [resultEmbed] });

            // Trả kết quả từng người
            let summary = '';
            for (const [userId, bet] of bets) {
                const user = await getUserData(userId);
                if (!user) continue;

                const win = bet.choice === result;
                const delta = win ? bet.amount : -bet.amount;
                await updateUserData(userId, { money: user.money + delta });

                summary += `<@${userId}> ${win ? '🎉 thắng' : '💀 thua'} **${Math.abs(delta)} xu**\n`;
            }

            if (summary) {
                await message.channel.send(summary);
            }

            gameRunning.delete(channelId);
        });
    },
};
