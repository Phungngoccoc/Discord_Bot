const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../../../service/userService');

module.exports = {
    name: 'bj',
    description: '🃏 Chơi Blackjack! Đặt cược và thử vận may của bạn!',
    execute: async (message) => {
        const userId = message.author.id;

        if (message.content.toLowerCase().includes('help')) {
            return message.channel.send("🃏 **Hướng dẫn chơi Blackjack** 🃏\n" +
                "1️⃣ Gõ `!bj <số tiền>` để đặt cược.\n" +
                "2️⃣ Bạn bắt đầu với 2 lá bài. Dealer cũng vậy.\n" +
                "3️⃣ `Rút thêm` để lấy thêm bài, tối đa 5 lá.\n" +
                "4️⃣ `Dừng` khi bạn muốn kết thúc lượt chơi.\n" +
                "5️⃣ Thắng nếu có điểm cao hơn dealer nhưng không quá 21.\n" +
                "💰 Ngũ linh (5 lá, tổng ≤ 21) thắng gấp 3 lần tiền cược!\n" +
                "⚠️ Cược tối đa: 200,000 xu.");
        }

        const match = message.content.match(/\d+/);
        let betAmount = match ? parseInt(match[0]) : 1;

        if (isNaN(betAmount) || betAmount <= 0) return message.reply("Vui lòng nhập số tiền cược hợp lệ.");
        if (betAmount > 200000000000000000000) return message.reply("Số tiền cược tối đa là 200,000 xu.");

        let user = await getUserData(userId);
        if (!user) {
            user = { money: 1000 };
            await updateUserData(userId, { money: user.money });
        }
        if (betAmount > user.money) return message.reply("Bạn không đủ tiền để cược số tiền này.");

        user.money -= betAmount;
        await updateUserData(userId, { money: user.money });

        // Tạo bộ bài 52 lá
        const createDeck = () => {
            const suits = ['♠', '♥', '♦', '♣'];
            const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            let deck = [];
            for (let suit of suits) {
                for (let value of values) {
                    deck.push({ value, suit });
                }
            }
            return deck.sort(() => Math.random() - 0.5); 
        };

        let deck = createDeck();

        const drawCard = () => deck.pop(); 

        const getCardValue = (card) => {
            if (['J', 'Q', 'K'].includes(card.value)) return 10;
            if (card.value === 'A') return 11;
            return parseInt(card.value);
        };

        const calculateScore = (cards) => {
            let total = cards.reduce((sum, card) => sum + getCardValue(card), 0);
            let aceCount = cards.filter(card => card.value === 'A').length;

            while (total > 21 && aceCount > 0) {
                total -= 10; 
                aceCount--;
            }

            return total;
        };

        let playerCards = [drawCard(), drawCard()];
        let botCards = [drawCard(), drawCard()];
        let playerScore = calculateScore(playerCards);
        let botScore = calculateScore(botCards);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('hit').setLabel('🃏 Rút thêm').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('stand').setLabel('🛑 Dừng').setStyle(ButtonStyle.Danger)
        );

        const cardToEmoji = (card) => `**${card.value}${card.suit}**`;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({ name: `${message.author.username} cược ${betAmount} xu`, iconURL: message.author.displayAvatarURL() })
            .addFields(
                { name: `👤 ${message.author.username} [${playerScore}]`, value: `${playerCards.map(cardToEmoji).join(' ')}`, inline: true },
                { name: `🤖 Dealer **[${getCardValue(botCards[0])}+?]**`, value: `${cardToEmoji(botCards[0])} ❓`, inline: true }
            );

        let msg = await message.channel.send({ embeds: [embed], components: [row] });

        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'hit') {
                let newCard = drawCard();
                playerCards.push(newCard);
                playerScore = calculateScore(playerCards);

                if (playerCards.length === 5 || playerScore > 21) {
                    return processGameEnd(interaction);
                }

                await interaction.update({
                    embeds: [new EmbedBuilder()
                        .setColor('#0099ff')
                        .setAuthor({ name: `${message.author.username} cược ${betAmount} xu`, iconURL: message.author.displayAvatarURL() })
                        .addFields(
                            { name: `👤 ${message.author.username} [${playerScore}]`, value: `${playerCards.map(cardToEmoji).join(' ')}`, inline: true },
                            { name: `🤖 Dealer **[${getCardValue(botCards[0])}+?]**`, value: `${cardToEmoji(botCards[0])} ❓`, inline: true }
                        )
                    ],
                    components: [row]
                });
            }

            if (interaction.customId === 'stand') {
                return processGameEnd(interaction);
            }
        });

        async function processGameEnd(interaction) {
            while (botScore < 16 || (botScore < playerScore && playerScore <= 21 && botCards.length < 4)) {
                botCards.push(drawCard());
                botScore = calculateScore(botCards);
            }
            const isPlayerFiveCard = playerCards.length === 5 && playerScore <= 21;
            const isBotFiveCard = botCards.length === 5 && botScore <= 21;
            let messageText = "";
            if (isPlayerFiveCard && !isBotFiveCard) {
                user.money += betAmount * 3;
                messageText = `**Ngũ linh!** Bạn thắng gấp 3 lần: **${betAmount * 3} xu**!`;
            } else if (isPlayerFiveCard && isBotFiveCard) {
                if (playerScore > botScore) {
                    user.money += betAmount * 3;
                    messageText = `**Ngũ linh!** Bạn thắng vì điểm cao hơn dealer! Nhận **${betAmount * 3} xu**!`;
                } else if (playerScore < botScore) {
                    messageText = `Dealer cũng có **Ngũ linh** với điểm cao hơn bạn! Bạn thua **${betAmount} xu**.`;
                } else {
                    user.money += betAmount;
                    messageText = `**Cả hai có Ngũ linh!** Hòa, bạn nhận lại **${betAmount} xu**.`;
                }
            } else if (isBotFiveCard && !isPlayerFiveCard) {
                messageText = `Dealer có **Ngũ linh**! Bạn thua **${betAmount} xu**.`;

            } else if (playerScore > 21 && botScore <= 21 && botScore >= 16) {
                messageText = `Bạn đã thua **${betAmount} xu**.`;
            } else if (playerScore === botScore) {
                user.money += betAmount;
                messageText = `Hòa! Bạn nhận lại **${betAmount} xu**.`;
            } else if (playerScore > 21 && botScore > 21) {
                user.money += betAmount;
                messageText = `Hòa, bạn nhận lại **${betAmount} xu**.`;
            } else if (playerScore <= 21 && botScore > 21 || playerScore <= 21 && playerScore > botScore) {
                user.money += betAmount * 2;
                messageText = `Bạn đã thắng **${betAmount} xu**.`;
            } else if (playerScore <= 21 && botScore < playerScore) {
                user.money += betAmount * 2;
                messageText = `Bạn đã thắng **${betAmount} xu**.`;

            } else {
                messageText = `Bạn đã thua **${betAmount} xu**.`;
            }

            await updateUserData(userId, { money: user.money });

            await interaction.update({
                embeds: [new EmbedBuilder()
                    .setColor('#0099ff')
                    .setAuthor({ name: `${message.author.username} cược ${betAmount} xu`, iconURL: message.author.displayAvatarURL() })
                    .addFields(
                        { name: `👤 ${message.author.username} [${playerScore}]`, value: `${playerCards.map(cardToEmoji).join(' ')}`, inline: true },
                        { name: `🤖 Dealer [${botScore}]`, value: `${botCards.map(cardToEmoji).join(' ')}`, inline: true },
                        { name: messageText, value: " " }
                    )
                ],
                components: []
            });

            collector.stop();
        }
    }
};
