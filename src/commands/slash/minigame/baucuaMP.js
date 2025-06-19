const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { getUserData, updateUserData } = require('../../../service/userService');

const emojiMap = {
    "bầu": "🍐",
    "cua": "🦀",
    "tôm": "🦐",
    "cá": "🐟",
    "gà": "🐓",
    "nai": "🦌"
};
const choices = Object.keys(emojiMap);
const betTime = 30000;
let activeGame = false;
let playerBets = {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('baucua')
        .setDescription('Tạo phòng chơi Bầu Cua với nhiều người')
        .addIntegerOption(option =>
            option.setName('tiencuoc')
                .setDescription('Số tiền cược mỗi lần đặt (mặc định: 1 xu)')
                .setMinValue(1)
                .setMaxValue(200000)
                .setRequired(false)
        ),
    category: 'game',

    async execute(interaction) {
        if (activeGame) {
            return interaction.reply({ content: 'Một trò chơi đang diễn ra. Vui lòng đợi!', flags: 64 });
        }

        const betAmount = interaction.options.getInteger('tiencuoc') || 1;
        const channel = interaction.channel;
        activeGame = true;
        playerBets = {};

        const embed = new EmbedBuilder()
            .setTitle(`🎲 Bầu Cua đã bắt đầu!`)
            .setDescription(`Tiền cược mỗi lần chọn: **${betAmount} xu**\nBạn có **30 giây** để đặt cược.\nCó thể cược nhiều lần!`)
            .setColor('#FFD700');

        const menu = new StringSelectMenuBuilder()
            .setCustomId('baucua_bet')
            .setPlaceholder('Chọn con vật muốn đặt cược')
            .setMinValues(1)
            .setMaxValues(6)
            .addOptions(choices.map(choice => ({
                label: choice.charAt(0).toUpperCase() + choice.slice(1),
                value: choice,
                emoji: emojiMap[choice]
            })));

        const row = new ActionRowBuilder().addComponents(menu);
        const msg = await channel.send({ embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({ time: betTime });

        collector.on('collect', async (i) => {
            const userId = i.user.id;
            const selected = i.values;
            let userData = await getUserData(userId);

            if (!userData) {
                userData = { money: 1000 };
                await updateUserData(userId, userData);
            }

            const totalCost = selected.length * betAmount;
            if (userData.money < totalCost) {
                return i.reply({ content: `Bạn không đủ tiền! Cần **${totalCost} xu**, bạn có **${userData.money} xu**.`, flags: 64 });
            }

            // Trừ tiền ngay khi đặt
            userData.money -= totalCost;
            await updateUserData(userId, { money: userData.money });

            if (!playerBets[userId]) {
                playerBets[userId] = { userData, bets: {} };
            }

            for (const choice of selected) {
                if (!playerBets[userId].bets[choice]) {
                    playerBets[userId].bets[choice] = 0;
                }
                playerBets[userId].bets[choice] += betAmount;
            }

            await i.reply({
                content: `Đặt cược thành công vào: ${selected.map(c => `${emojiMap[c]} ${c}`).join(', ')}\nTổng tiền đã cược: **${Object.entries(playerBets[userId].bets).reduce((s, [k, v]) => s + v, 0)} xu**.`,
                flags: 64
            });
        });

        collector.on('end', async () => {
            if (Object.keys(playerBets).length === 0) {
                activeGame = false;
                return channel.send('Không có người tham gia, trò chơi bị hủy.');
            }

            // Animation tung xúc xắc
            const rollResults = [
                choices[Math.floor(Math.random() * choices.length)],
                choices[Math.floor(Math.random() * choices.length)],
                choices[Math.floor(Math.random() * choices.length)],
            ];

            const rollEmojis = rollResults.map(c => emojiMap[c]);

            const animationSteps = [
                '| ⏳ | ⏳ | ⏳ |',
                `| ${rollEmojis[0]} | ⏳ | ⏳ |`,
                `| ${rollEmojis[0]} | ${rollEmojis[1]} | ⏳ |`,
                `| ${rollEmojis[0]} | ${rollEmojis[1]} | ${rollEmojis[2]} |`
            ];

            const animEmbed = new EmbedBuilder()
                .setTitle('🎲 Tung xúc xắc Bầu Cua...')
                .setDescription(animationSteps[0])
                .setColor('#FFA500');

            await msg.edit({ embeds: [animEmbed], components: [] });

            let animIndex = 1;
            const interval = setInterval(async () => {
                if (animIndex >= animationSteps.length) {
                    clearInterval(interval);

                    const resultCount = rollResults.reduce((acc, r) => {
                        acc[r] = (acc[r] || 0) + 1;
                        return acc;
                    }, {});

                    const resultEmbed = new EmbedBuilder()
                        .setTitle('🎉 Kết quả Bầu Cua 🎉')
                        .setDescription(`${animationSteps[3]}`)
                        .setColor('#00FF00');

                    await msg.edit({ embeds: [resultEmbed] });

                    // Tổng kết kết quả
                    let resultText = '**📜 Kết quả người chơi:**\n';
                    for (const userId in playerBets) {
                        const { userData, bets } = playerBets[userId];
                        let win = 0;
                        let totalBet = 0;

                        for (const [choice, amount] of Object.entries(bets)) {
                            const match = resultCount[choice] || 0;
                            win += amount * match * 2;
                            totalBet += amount;
                        }

                        const net = win - totalBet;
                        userData.money += win; // trả thưởng
                        await updateUserData(userId, { money: userData.money });

                        const tag = `<@${userId}>`;
                        if (net > 0) {
                            resultText += `${tag} thắng **${net} xu**! (Đặt: ${totalBet}, Nhận: ${win})\n`;
                        } else if (net < 0) {
                            resultText += `${tag} thua **${-net} xu**! (Đặt: ${totalBet}, Nhận: ${win})\n`;
                        } else {
                            resultText += `${tag} hòa. (Đặt: ${totalBet}, Nhận: ${win})\n`;
                        }
                    }

                    activeGame = false;
                    await channel.send(resultText);
                } else {
                    animEmbed.setDescription(animationSteps[animIndex]);
                    await msg.edit({ embeds: [animEmbed] });
                    animIndex++;
                }
            }, 1000);
        });
    }
};
