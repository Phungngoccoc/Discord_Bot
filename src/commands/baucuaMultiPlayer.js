const Discord = require("discord.js");
const { getUserData, updateUserData } = require('../service/userService');

const emojiMap = {
    "bầu": "🍐",
    "cua": "🦀",
    "tôm": "🦐",
    "cá": "🐟",
    "gà": "🐓",
    "nai": "🦌"
};

const choices = Object.keys(emojiMap);
const betTime = 30000; // 30 giây đặt cược
let activeGame = false;
let playerBets = {}; // Lưu cược của từng người

module.exports = {
    name: "bcmp",
    description: "Chơi Bầu Cua với nhiều người! Đặt cược bằng reaction!",
    execute: async (message) => {
        if (activeGame) return message.reply("⚠ Hiện tại đã có trò chơi đang diễn ra. Vui lòng đợi!");

        activeGame = true;
        playerBets = {};

        // Tạo tin nhắn đặt cược
        const embed = new Discord.EmbedBuilder()
            .setTitle("🎲 Chơi Bầu Cua 🎲")
            .setDescription("Hãy đặt cược bằng cách reaction vào con vật bạn chọn!\nBạn có **30 giây** để đặt cược!")
            .setColor("#ffcc00");

        const sentMessage = await message.channel.send({ embeds: [embed] });

        // Thêm reaction emoji
        for (let emoji of Object.values(emojiMap)) {
            await sentMessage.react(emoji);
        }

        // Thu thập reaction trong 30 giây
        const filter = (reaction, user) => !user.bot && Object.values(emojiMap).includes(reaction.emoji.name);
        const collector = sentMessage.createReactionCollector({ filter, time: betTime });

        collector.on("collect", async (reaction, user) => {
            let userId = user.id;
            let choice = Object.keys(emojiMap).find(key => emojiMap[key] === reaction.emoji.name);

            if (!choice) return;

            // Lấy dữ liệu người chơi
            let userData = await getUserData(userId);
            if (!userData) {
                userData = { money: 1000 };
                await updateUserData(userId, { money: userData.money });
            }

            let betAmount = 100; // Mặc định đặt 100 xu
            if (userData.money < betAmount) return message.channel.send(`<@${userId}>, bạn không đủ tiền để cược!`);

            playerBets[userId] = { choice, betAmount, userData };
            message.channel.send(`<@${userId}> đã đặt cược **${betAmount} xu** vào **${reaction.emoji.name}**!`);
        });

        collector.on("end", async () => {
            if (Object.keys(playerBets).length === 0) {
                activeGame = false;
                return message.channel.send("❌ Không có ai tham gia! Trò chơi bị hủy.");
            }

            // Tung xúc xắc (3 con)
            let results = [
                choices[Math.floor(Math.random() * choices.length)],
                choices[Math.floor(Math.random() * choices.length)],
                choices[Math.floor(Math.random() * choices.length)]
            ];

            let resultsWithEmoji = results.map(item => emojiMap[item]);

            // Kiểm tra kết quả từng người chơi
            let resultText = `🎲 **Kết quả:** ${resultsWithEmoji.join(" - ")}\n\n`;
            for (let userId in playerBets) {
                let { choice, betAmount, userData } = playerBets[userId];
                let winCount = results.filter(res => res === choice).length;
                let winAmount = betAmount * winCount;

                if (winCount > 0) {
                    userData.money += winAmount;
                    resultText += `✅ <@${userId}> đặt ${emojiMap[choice]} và **thắng ${winAmount} xu**!\n`;
                } else {
                    userData.money -= betAmount;
                    resultText += `❌ <@${userId}> đặt ${emojiMap[choice]} nhưng không trúng, mất ${betAmount} xu.\n`;
                }

                await updateUserData(userId, { money: userData.money });
            }

            activeGame = false;
            message.channel.send(resultText);
        });
    }
};
