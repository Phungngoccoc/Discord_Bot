const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../service/userService');  // Đảm bảo đường dẫn đúng

// Hàm chơi blackjack
module.exports = {
    name: 'bj',
    description: '🃏 Chơi Blackjack! Đặt cược và thử vận may của bạn!',
    execute: async (message) => {
        const userId = message.author.id;
        const getCard = () => Math.floor(Math.random() * 11) + 1;

        // Lấy dữ liệu người dùng từ MongoDB
        let user = await getUserData(userId);

        // Nếu người dùng chưa có tiền, tạo mới với 1000 tiền
        if (!user) {
            user = { money: 1000 };
            await updateUserData(userId, { money: user.money });
        }

        // Lấy số tiền cược từ message.content bằng regex
        const match = message.content.match(/blackjack (\d+)/);
        let betAmount = 1; // Giá trị mặc định nếu không có tham số

        if (match && match[1]) {
            betAmount = parseInt(match[1]);
        }

        // Kiểm tra tính hợp lệ của số tiền cược
        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply("❌ Vui lòng cung cấp số tiền cược hợp lệ. Ví dụ: `!blackjack 1000`.");
        }

        if (betAmount > user.money) {
            return message.reply("❌ Bạn không đủ tiền để cược số tiền này.");
        }

        // Trừ tiền cược
        user.money -= betAmount;
        await updateUserData(userId, { money: user.money });

        let playerCards = [getCard(), getCard()];
        let botCards = [getCard(), getCard()];
        let playerScore = playerCards.reduce((a, b) => a + b, 0);
        let botScore = botCards.reduce((a, b) => a + b, 0);

        // Tạo nút Rút thêm và Dừng
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('hit').setLabel('🃏 Rút thêm').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('stand').setLabel('🛑 Dừng').setStyle(ButtonStyle.Danger)
        );

        // Hàm chuyển đổi số thành emoji đại diện cho các quân bài
        const cardToEmoji = (cardValue) => {
            const cardEmojis = {
                1: '🂡', 2: '🂢', 3: '🂣', 4: '🂤', 5: '🂥', 6: '🂦',
                7: '🂧', 8: '🂨', 9: '🂩', 10: '🂪', 11: '🃏',
            };
            return cardEmojis[cardValue] || '🎴'; // Default to a generic card emoji if not found
        };

        // Tạo Embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({
                name: `${message.author.username} đang chơi Blackjack`,
                iconURL: message.author.displayAvatarURL(),
            })
            .setThumbnail(message.author.displayAvatarURL())
            .addFields(
                { name: `🎴 ${message.author.username} [${playerScore}]`, value: `${playerCards.map(card => cardToEmoji(card)).join(' ')}`, inline: true },
                { name: '                🤖 Dealer **[10+?]**', value: `🂪🂪`, inline: true }
            );

        let msg = await message.reply({
            embeds: [embed],
            components: [row]
        });

        // Bộ xử lý tương tác nút bấm
        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'hit') {
                let newCard = getCard();
                playerCards.push(newCard);
                playerScore += newCard;

                if (playerScore > 21) {
                    while (botScore < 17) {
                        botCards.push(getCard());
                        botScore = botCards.reduce((a, b) => a + b, 0);
                    }

                    let result, mess;
                    //hòa
                    if (playerScore === botScore || playerScore > 21 && botScore > 21) {
                        user.money += betAmount;
                        result = `${botCards.map(card => cardToEmoji(card)).join(' ')}`;
                        mess = `Hòa! Bạn đã nhận lại ${betAmount} xu`;
                    }
                    // Kiểm tra nếu người chơi thắng
                    else if (playerScore > botScore && playerScore <= 21) {
                        user.money += betAmount * 2;
                        result = `${botCards.map(card => cardToEmoji(card)).join(' ')}`;
                        mess = `Bạn đã thắng ${betAmount} xu`;
                    } else {
                        user.money -= betAmount;
                        result = `${botCards.map(card => cardToEmoji(card)).join(' ')}`;
                        mess = `Bạn đã thua ${betAmount} xu`;
                    }

                    await updateUserData(userId, { money: user.money });

                    await interaction.update({
                        embeds: [new EmbedBuilder()
                            .setColor('#0099ff')
                            .setAuthor({
                                name: `${message.author.username} đang chơi Blackjack`,
                                iconURL: message.author.displayAvatarURL(),
                            })
                            .setThumbnail(message.author.displayAvatarURL())
                            .addFields(
                                { name: `🎴 ${message.author.username} [${playerScore}]`, value: `${playerCards.map(card => cardToEmoji(card)).join(' ')}`, inline: true },
                                { name: `🤖 Dealer **[${botScore}]**`, value: `${result}`, inline: true },
                                { name: mess, value: " " }
                            )
                        ],
                        components: []
                    });

                    return collector.stop();
                }

                await interaction.update({
                    embeds: [new EmbedBuilder()
                        .setColor('#0099ff')
                        .setAuthor({
                            name: `${message.author.username} đang chơi Blackjack`,
                            iconURL: message.author.displayAvatarURL(),
                        })
                        .setThumbnail(message.author.displayAvatarURL())
                        .addFields(
                            { name: `🎴 ${message.author.username} [${playerScore}]`, value: `${playerCards.map(card => cardToEmoji(card)).join(' ')}`, inline: true },
                            { name: '🤖 Dealer **[10+?]**', value: ` `, inline: true }
                        )
                    ],
                    components: [row]
                });
            }

            if (interaction.customId === 'stand') {
                // Bot tiếp tục rút nếu điểm của bot dưới 16
                while (botScore < 17) {
                    botCards.push(getCard());
                    botScore = botCards.reduce((a, b) => a + b, 0);
                }

                let result, mess;
                //hòa
                if (playerScore === botScore || playerScore > 21 && botScore > 21) {
                    user.money += betAmount;
                    result = `${botCards.map(card => cardToEmoji(card)).join(' ')}`;
                    mess = `Hòa! Bạn đã nhận lại ${betAmount} xu`;
                }
                // Kiểm tra nếu người chơi thắng
                else if (playerScore > botScore && playerScore <= 21) {
                    user.money += betAmount * 2;
                    result = `${botCards.map(card => cardToEmoji(card)).join(' ')}`;
                    mess = `Bạn đã thắng ${betAmount} xu`;
                } else {
                    user.money -= betAmount;
                    result = `${botCards.map(card => cardToEmoji(card)).join(' ')}`;
                    mess = `Bạn đã thua ${betAmount} xu`;
                }

                await updateUserData(userId, { money: user.money });

                await interaction.update({
                    embeds: [new EmbedBuilder()
                        .setColor('#0099ff')
                        .setAuthor({
                            name: `${message.author.username} đang chơi Blackjack`,
                            iconURL: message.author.displayAvatarURL(),
                        })
                        .setThumbnail(message.author.displayAvatarURL())
                        .addFields(
                            { name: `🎴 ${message.author.username} [${playerScore}]`, value: `${playerCards.map(card => cardToEmoji(card)).join(' ')}`, inline: true },
                            { name: `🤖 Dealer **[${botScore}]**`, value: `${result}`, inline: true },
                            { name: mess, value: " " }
                        )
                    ],
                    components: []
                });
            }
        });
    }
};
