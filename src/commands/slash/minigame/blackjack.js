const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../../../service/userService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Chơi Blackjack!')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('Số tiền muốn cược')
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const betAmount = interaction.options.getInteger('bet');

        if (isNaN(betAmount) || betAmount <= 0) return interaction.reply({ content: 'Vui lòng nhập số tiền cược hợp lệ.', flags: 64 });
        if (betAmount > 200000) return interaction.reply({ content: 'Số tiền cược tối đa là 200,000 xu.', flags: 64 });

        let user = await getUserData(userId);
        if (!user) {
            user = { money: 1000 };
            await updateUserData(userId, { money: user.money });
        }
        if (betAmount > user.money) return interaction.reply({ content: 'Bạn không đủ tiền để cược số tiền này.', flags: 64 });

        user.money -= betAmount;
        await updateUserData(userId, { money: user.money });

        const createDeck = () => {
            const suits = ['♠', '♥', '♦', '♣'];
            const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            return suits.flatMap(suit => values.map(value => ({ value, suit }))).sort(() => Math.random() - 0.5);
        };

        const drawCard = (deck) => deck.pop();
        const getCardValue = (card) => ['J', 'Q', 'K'].includes(card.value) ? 10 : card.value === 'A' ? 11 : parseInt(card.value);
        const calculateScore = (cards) => {
            let total = cards.reduce((sum, card) => sum + getCardValue(card), 0);
            let aces = cards.filter(c => c.value === 'A').length;
            while (total > 21 && aces--) total -= 10;
            return total;
        };

        const cardToEmoji = (card) => `**${card.value}${card.suit}**`;

        let deck = createDeck();
        let playerCards = [drawCard(deck), drawCard(deck)];
        let dealerCards = [drawCard(deck), drawCard(deck)];
        let playerScore = calculateScore(playerCards);
        let dealerScore = calculateScore(dealerCards);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('hit').setLabel('🃏 Rút thêm').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('stand').setLabel('🛑 Dừng').setStyle(ButtonStyle.Danger)
        );

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({ name: `${interaction.user.username} cược ${betAmount} xu`, iconURL: interaction.user.displayAvatarURL() })
            .addFields(
                { name: `👤 ${interaction.user.username} [${playerScore}]`, value: `${playerCards.map(cardToEmoji).join(' ')}`, inline: true },
                { name: `🤖 Dealer [${getCardValue(dealerCards[0])}+?]`, value: `${cardToEmoji(dealerCards[0])} ❓`, inline: true }
            );

        await interaction.reply({ embeds: [embed], components: [row] });

        const msg = await interaction.fetchReply();

        const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === userId, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'hit') {
                let newCard = drawCard(deck);
                playerCards.push(newCard);
                playerScore = calculateScore(playerCards);

                if (playerCards.length === 5 || playerScore > 21) return endGame(i);

                await i.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#0099ff')
                            .setAuthor({ name: `${interaction.user.username} cược ${betAmount} xu`, iconURL: interaction.user.displayAvatarURL() })
                            .addFields(
                                { name: `👤 ${interaction.user.username} [${playerScore}]`, value: `${playerCards.map(cardToEmoji).join(' ')}`, inline: true },
                                { name: `🤖 Dealer [${getCardValue(dealerCards[0])}+?]`, value: `${cardToEmoji(dealerCards[0])} ❓`, inline: true }
                            )
                    ],
                    components: [row]
                });
            } else if (i.customId === 'stand') {
                return endGame(i);
            }
        });

        async function endGame(interaction) {
            while (dealerScore < 16 || (dealerScore < playerScore && playerScore <= 21 && dealerCards.length < 5)) {
                dealerCards.push(drawCard(deck));
                dealerScore = calculateScore(dealerCards);
            }

            let result = '', winAmount = 0;
            const isPlayerFive = playerCards.length === 5 && playerScore <= 21;
            const isDealerFive = dealerCards.length === 5 && dealerScore <= 21;

            if (isPlayerFive && !isDealerFive) {
                winAmount = betAmount * 3; result = `**Ngũ linh!** Bạn thắng ${winAmount} xu!`;
            } else if (isDealerFive && !isPlayerFive) {
                result = `Dealer có **Ngũ linh**! Bạn thua ${betAmount} xu.`;
            } else if (playerScore > 21 && dealerScore <= 21) {
                result = `Bạn quá 21 điểm! Thua ${betAmount} xu.`;
            } else if (dealerScore > 21 && playerScore <= 21 || playerScore > dealerScore) {
                winAmount = betAmount * 2; result = `Bạn thắng ${winAmount} xu!`;
            } else if (playerScore === dealerScore) {
                winAmount = betAmount; result = `Hòa! Bạn nhận lại ${winAmount} xu.`;
            } else {
                result = `Bạn thua ${betAmount} xu.`;
            }

            user.money += winAmount;
            await updateUserData(userId, { money: user.money });

            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#0099ff')
                        .setAuthor({ name: `${interaction.user.username} cược ${betAmount} xu`, iconURL: interaction.user.displayAvatarURL() })
                        .addFields(
                            { name: `👤 ${interaction.user.username} [${playerScore}]`, value: `${playerCards.map(cardToEmoji).join(' ')}`, inline: true },
                            { name: `🤖 Dealer [${dealerScore}]`, value: `${dealerCards.map(cardToEmoji).join(' ')}`, inline: true },
                            { name: result, value: ' ' }
                        )
                ],
                components: []
            });

            collector.stop();
        }
    }
};