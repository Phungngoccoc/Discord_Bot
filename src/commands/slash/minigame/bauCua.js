const { SlashCommandBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../../../service/userService');

const choices = ["bầu", "cua", "tôm", "cá", "gà", "nai"];
const emojiMap = {
    "bầu": "🍐",
    "cua": "🦀",
    "tôm": "🦐",
    "cá": "🐟",
    "gà": "🐓",
    "nai": "🦌"
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bc1')
        .setDescription('Chơi Bầu Cua: đặt cược vào 1 con vật, nếu ra trúng sẽ thắng xu!')
        .addStringOption(option =>
            option.setName('convat')
                .setDescription('Chọn con vật để đặt cược')
                .setRequired(true)
                .addChoices(
                    ...choices.map(item => ({ name: item, value: item }))
                )
        )
        .addIntegerOption(option =>
            option.setName('sotien')
                .setDescription('Số xu bạn muốn đặt cược')
                .setMinValue(1)
                .setMaxValue(200000)
                .setRequired(true)
        ),
    category: 'game',

    async execute(interaction) {
        const userId = interaction.user.id;
        const betChoice = interaction.options.getString('convat');
        const betAmount = interaction.options.getInteger('sotien');

        let user = await getUserData(userId);
        if (!user) {
            user = { money: 1000 };
            await updateUserData(userId, { money: user.money });
        }

        if (betAmount > user.money) {
            return interaction.reply({
                content: 'Bạn không đủ tiền để cược số tiền này!',
                flags: 64
            });
        }

        // Trừ tiền cược ban đầu
        user.money -= betAmount;

        // Quay 5 lần
        const results = Array.from({ length: 5 }, () =>
            choices[Math.floor(Math.random() * choices.length)]
        );
        const resultsWithEmoji = results.map(item => emojiMap[item]);

        // Tính số lần trúng và tiền thắng
        const winCount = results.filter(item => item === betChoice).length;
        const winAmount = betAmount * winCount;

        if (winCount > 0) {
            user.money += winAmount;
        }

        await updateUserData(userId, { money: user.money });

        const resultText = `**Kết quả:** ${resultsWithEmoji.join(' - ')}\n`;
        const summary = winCount > 0
            ? `Bạn đặt **${betChoice}** và trúng ${winCount} lần → nhận **+${winAmount} xu**!`
            : `Bạn đặt **${betChoice}** nhưng không trúng → mất **${betAmount} xu**.`;

        return interaction.reply(resultText + summary);
    }
};
