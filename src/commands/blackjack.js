const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../service/userService');

module.exports = {
    name: 'bj',
    description: '🃏 Chơi Blackjack! Đặt cược và thử vận may của bạn!',
    execute: async (message) => {
        const userId = message.author.id;

        if (message.content.toLowerCase().includes('help')) {
            return message.reply("🃏 **Hướng dẫn chơi Blackjack** 🃏\n" +
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

        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply("❌ Vui lòng nhập số tiền cược hợp lệ. Ví dụ: `!bj 1000`.");
        }
        if (betAmount > 200000) {
            return message.reply("❌ Số tiền cược tối đa là 200,000 xu.");
        }

        let user = await getUserData(userId);
        if (!user) {
            user = { money: 1000 };
            await updateUserData(userId, { money: user.money });
        }
        if (betAmount > user.money) {
            return message.reply("❌ Bạn không đủ tiền để cược số tiền này.");
        }

        user.money -= betAmount;
        await updateUserData(userId, { money: user.money });

        const getCard = () => Math.floor(Math.random() * 11) + 1;
        const calculateScore = (cards) => {
            let total = cards.reduce((a, b) => a + b, 0);
            if (cards.includes(1) && total + 10 <= 21) total += 10;
            return total;
        };

        let playerCards = [getCard(), getCard()];
        let botCards = [getCard(), getCard()];
        let playerScore = calculateScore(playerCards);
        let botScore = calculateScore(botCards);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('hit').setLabel('🃏 Rút thêm').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('stand').setLabel('🛑 Dừng').setStyle(ButtonStyle.Danger)
        );

        const cardToEmoji = (cardValue) => {
            const cardEmojis = {
                1: '<:1_:1338480816723988511>', 2: '<:2_:1338480819597082745>', 3: '<:3_:1338480822029652089>', 4: '<:4_:1338480824005431348> ', 5: '<:5_:1338480827176325120>', 6: '<:6_:1338480835313139762>',
                7: '<:7_:1338480838089904202>', 8: '<:8_:1338480840681984012>', 9: '<:9_:1338480844184227931>', 10: '<:10:1338480847380283393> ', 11: '<:1_:1338480816723988511> ', 0: '<:backcard:1338483881506111549>'
            };
            return cardEmojis[cardValue] || '🎴'; // Default to a generic card emoji if not found
        };

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({ name: `${message.author.username} cược ${betAmount} xu`, iconURL: message.author.displayAvatarURL() })
            .addFields(
                { name: `👤 ${message.author.username} [${playerScore}]`, value: `${playerCards.map(cardToEmoji).join(' ')}`, inline: true },
                { name: `🤖 Dealer **[${botCards[0]}+?]**`, value: `${cardToEmoji(botCards[0])} ${cardToEmoji(0)}`, inline: true }
            );

        let msg = await message.reply({ embeds: [embed], components: [row] });

        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'hit') {
                let newCard = getCard();
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
                            { name: `🤖 Dealer **[${botCards[0]}+?]**`, value: `${cardToEmoji(botCards[0])} ${cardToEmoji(0)}`, inline: true }
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
            while (botScore < 16 || (botScore < playerScore && playerScore <= 21 && botCards.length < 5)) {
                botCards.push(getCard());
                botScore = calculateScore(botCards);
            }

            const isPlayerFiveCard = playerCards.length === 5 && playerScore <= 21;
            const isBotFiveCard = botCards.length === 5 && botScore <= 21;
            let messageText = "";

            if (isPlayerFiveCard && !isBotFiveCard) {
                user.money += betAmount * 3;
                messageText = `🎉 **Ngũ linh!** Bạn thắng gấp 3 lần: **${betAmount * 3} xu**!`;
            } else if (isPlayerFiveCard && isBotFiveCard) {
                if (playerScore > botScore) {
                    user.money += betAmount * 3;
                    messageText = `🎉 **Ngũ linh!** Bạn thắng vì điểm cao hơn dealer! Nhận **${betAmount * 3} xu**!`;
                } else if (playerScore < botScore) {
                    messageText = `😢 Dealer cũng có **Ngũ linh** với điểm cao hơn bạn! Bạn thua **${betAmount} xu**.`;
                } else {
                    user.money += betAmount;
                    messageText = `🤝 **Cả hai có Ngũ linh!** Hòa, bạn nhận lại **${betAmount} xu**.`;
                }
            } else if (playerScore > 21) {
                messageText = `Bạn đã thua **${betAmount} xu**.`;
            } else if (botScore > 21 || playerScore > botScore) {
                user.money += betAmount * 2;
                messageText = `🎉 Bạn thắng **${betAmount * 2} xu**!`;
            } else if (playerScore === botScore) {
                user.money += betAmount;
                messageText = `🤝 Hòa! Bạn nhận lại **${betAmount} xu**.`;
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
