const Discord = require("discord.js");
const { getUserData, updateUserData } = require('../../../service/userService');

module.exports = {
    name: "bc1",
    description: "Chơi Bầu Cua bằng cách đặt cược vào một con vật!",
    execute: async (message) => {
        const userId = message.author.id;
        const choices = ["bầu", "cua", "tôm", "cá", "gà", "nai"];
        const match = message.content.match(/\d+/);
        let betAmount = match ? parseInt(match[0]) : 1;
        const emojiMap = {
            "bầu": "🍐",
            "cua": "🦀",
            "tôm": "🦐",
            "cá": "🐟",
            "gà": "🐓",
            "nai": "🦌"
        };

        if (isNaN(betAmount) || betAmount <= 0) return message.reply("Vui lòng nhập số tiền cược hợp lệ.");
        if (betAmount > 200000) return message.reply("Số tiền cược tối đa là 200,000 xu.");

        let user = await getUserData(userId);
        if (!user) {
            user = { money: 1000 };
            await updateUserData(userId, { money: user.money });
        }
        if (betAmount > user.money) return message.reply("Bạn không đủ tiền để cược số tiền này.");

        user.money -= betAmount;
        await updateUserData(userId, { money: user.money });

        const choice = message.content.match(/\b(bầu|cua|tôm|cá|gà|nai)\b/i);
        let betChoice = choice ? choice[0] : null;
        if (betChoice !== null && !choices.includes(betChoice ?? betChoice.toLowerCase())) {
            return message.reply("Bạn chỉ có thể đặt cược vào: **Bầu, Cua, Tôm, Cá, Gà, Nai**.");
        } else if (betChoice === null) {
            return message.reply("Bạn chỉ có thể đặt cược vào: **Bầu, Cua, Tôm, Cá, Gà, Nai**.");
        }
        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply("Số tiền cược không hợp lệ!");
        }

        if (user.money < betAmount) {
            return message.reply("Bạn không có đủ tiền để cược!");
        }

        let results = [
            choices[Math.floor(Math.random() * choices.length)],
            choices[Math.floor(Math.random() * choices.length)],
            choices[Math.floor(Math.random() * choices.length)],
            choices[Math.floor(Math.random() * choices.length)],
            choices[Math.floor(Math.random() * choices.length)]
        ];
        let resultsWithEmoji = results.map(item => emojiMap[item]);

        let winCount = results.filter(result => result === betChoice).length;
        let winAmount = betAmount * winCount;

        if (winCount > 0) {
            user.money += winAmount;
            message.reply(`**Kết quả:** ${resultsWithEmoji.join(" - ")}\nBạn đặt **${betChoice}** và thắng **${winAmount} xu**!`);
        } else {
            user.money -= betAmount;
            message.reply(`**Kết quả:** ${resultsWithEmoji.join(" - ")}\nBạn đặt **${betChoice}** nhưng không trúng, mất **${betAmount} xu**.`);
        }
    }
};
