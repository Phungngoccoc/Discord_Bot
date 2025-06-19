const Discord = require("discord.js");
const { getUserData, updateUserData } = require("../../../service/userService");

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
    name: "bc",
    description: "Chơi Bầu Cua với nhiều người! Đặt cược bằng reaction!",
    execute: async (message) => {
        if (activeGame) return message.reply("⚠ Hiện tại đã có trò chơi đang diễn ra. Vui lòng đợi!");
        const match = message.content.match(/\d+/);
        let betAmount = match && !isNaN(match[0]) ? parseInt(match[0]) : 1;
        activeGame = true;
        playerBets = {};

        const embed = new Discord.EmbedBuilder()
            .setTitle(`🎲 Chơi Bầu Cua. Tiền cược mỗi lần là ${betAmount} 🎲`)
            .setDescription("Hãy đặt cược bằng cách **reaction** vào con vật bạn chọn!\nBạn có **30 giây** để đặt cược!\n Lưu ý: Chờ bot thêm các emoji vào tin nhắn trước khi đặt cược!")
            .setColor("#ffcc00");

        const sentMessage = await message.channel.send({ embeds: [embed] });

        for (let emoji of Object.values(emojiMap)) {
            await sentMessage.react(emoji);
        }

        const filter = (reaction, user) => {
            return !user.bot && Object.values(emojiMap).includes(reaction.emoji.name);
        };
        const collector = sentMessage.createReactionCollector({ filter, time: betTime });

        collector.on("collect", async (reaction, user) => {
            let userId = user.id;
            let choice = Object.keys(emojiMap).find(key => emojiMap[key] === reaction.emoji.name);
            if (!choice) return;

            let userData = await getUserData(userId);
            if (!userData) {
                userData = { money: 1000 };
                await updateUserData(userId, { money: userData.money });
            }

            // Tính tổng số tiền đã cược của user
            let totalBet = Object.values(playerBets[userId] || {}).reduce((sum, bet) => sum + bet.betAmount, 0);

            if (totalBet + betAmount > userData.money) {
                return user.send(`Bạn không đủ tiền để đặt cược thêm! Tổng cược hiện tại: ${totalBet} xu, Số dư: ${userData.money} xu.`);
            }

            if (!playerBets[userId]) playerBets[userId] = {};
            if (!playerBets[userId][choice]) {
                playerBets[userId][choice] = { betAmount, userData };
            } else {
                playerBets[userId][choice].betAmount += betAmount;
            }

            user.send(`Bạn đã đặt cược **${betAmount} xu** vào **${reaction.emoji.name}**! (Tổng: ${playerBets[userId][choice].betAmount} xu)`);
        });


        collector.on("end", async () => {
            if (Object.keys(playerBets).length === 0) {
                activeGame = false;
                return message.channel.send("Không có ai tham gia! Trò chơi bị hủy.");
            }

            let results = [
                choices[Math.floor(Math.random() * choices.length)],
                choices[Math.floor(Math.random() * choices.length)],
                choices[Math.floor(Math.random() * choices.length)]
            ];

            let resultsWithEmoji = results.map(item => emojiMap[item]);

            let resultCount = {};
            for (let r of results) {
                resultCount[r] = (resultCount[r] || 0) + 1;
            }

            let animationSteps = [
                "| ⏳ | ⏳ | ⏳ |",
                `| ${resultsWithEmoji[0]} | ⏳ | ⏳ |`,
                `| ${resultsWithEmoji[0]} | ${resultsWithEmoji[1]} | ⏳ |`,
                `| ${resultsWithEmoji[0]} | ${resultsWithEmoji[1]} | ${resultsWithEmoji[2]} |`
            ];

            let index = 0;

            const resultEmbed = new Discord.EmbedBuilder()
                .setTitle("🎲 Đang Tung Xúc Xắc 🎲")
                .setDescription(animationSteps[index])
                .setColor("#ffcc00");

            await sentMessage.edit({ embeds: [resultEmbed] });

            let animationInterval = setInterval(async () => {
                index++;
                if (index >= animationSteps.length) {
                    clearInterval(animationInterval);

                    let finalEmbed = new Discord.EmbedBuilder()
                        .setTitle("🎲 Kết quả Bầu Cua 🎲")
                        .setDescription(`👉 ${animationSteps[3]}`)
                        .setColor("#00ff00");

                    await sentMessage.edit({ embeds: [finalEmbed] });

                    let resultText = `🎲 **Kết quả:** ${animationSteps[3]}\n\n`;

                    for (let userId in playerBets) {
                        let totalBet = Object.values(playerBets[userId]).reduce((sum, bet) => sum + bet.betAmount, 0);
                        let totalWin = 0;
                        let userData = Object.values(playerBets[userId])[0].userData;

                        for (let choice in playerBets[userId]) {
                            let betAmount = playerBets[userId][choice].betAmount;
                            let winCount = resultCount[choice] || 0;
                            totalWin += winCount * betAmount * 2;
                        }

                        let netChange = totalWin - totalBet;
                        userData.money += netChange;
                        await updateUserData(userId, { money: userData.money });

                        if (netChange > 0) {
                            resultText += `<@${userId}> **thắng ${netChange} xu**! (Đặt: ${totalBet}, Nhận: ${totalWin})\n`;
                        } else if (netChange < 0) {
                            resultText += `<@${userId}> **thua ${Math.abs(netChange)} xu**! (Đặt: ${totalBet}, Nhận: ${totalWin})\n`;
                        } else {
                            resultText += `<@${userId}> **hòa!** (Đặt: ${totalBet}, Nhận: ${totalWin})\n`;
                        }
                    }

                    activeGame = false;
                    message.channel.send(resultText);
                } else {
                    let updatedEmbed = new Discord.EmbedBuilder()
                        .setTitle("🎲 Xổ số Bầu Cua 🎲")
                        .setDescription(animationSteps[index])
                        .setColor("#ffcc00");
                    await sentMessage.edit({ embeds: [updatedEmbed] });
                }
            }, 1000);
        });
    }
};
