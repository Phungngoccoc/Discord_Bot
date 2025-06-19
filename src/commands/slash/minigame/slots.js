const { SlashCommandBuilder } = require('discord.js');
const User = require('../../../model/userModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slot')
        .setDescription('mini game máy đánh bạc!')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('Số tiền muốn cược')
                .setRequired(false)
        ),

    async execute(interaction) {
        const symbols = [
            '<:slots1:1338720715054256168>',
            '<:slots2:1338720717323239494>',
            '<:slots6:1338720727322595498>',
            '<:slots5:1338720724864602253>',
            '<:slots3:1338720719345029164>',
            '<:slots4:1338721143267262524>',
        ];
        const loadingIcon = '<a:slot:1338518091973263443>';

        const betAmount = interaction.options.getInteger('bet') || 1;

        const userId = interaction.user.id;
        let user = await User.findOne({ userId });

        if (!user) {
            user = new User({ userId, money: 1000, wins: 0, losses: 0 });
            await user.save();
        }

        if (betAmount <= 0 || betAmount > user.money) {
            return interaction.reply({
                content: `Số tiền cược không hợp lệ! Bạn chỉ có ${user.money} xu.`,
                flags: 64,
            });
        }

        const displayName = interaction.member?.nickname || interaction.user.globalName || interaction.user.username;

        let slots = [null, null, null];

        const msg = await interaction.reply({
            content: `**  \`___SLOTS___\`**\n\` \` ${loadingIcon} ${loadingIcon} ${loadingIcon} \` \` ${displayName} cược ${betAmount} xu\n  \`|         |\`\n  \`|         |\``,
            fetchReply: true,
        });

        const spinSlot = () => symbols[Math.floor(Math.random() * symbols.length)];

        for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 800));
            slots[i] = spinSlot();
            const display = slots.map(s => s || loadingIcon).join(' ');
            await msg.edit(`**  \`___SLOTS___\`**\n\` \` ${display} \` \` ${displayName} cược ${betAmount} xu\n  \`|         |\`\n  \`|         |\``);
        }

        const [a, b, c] = slots;
        let winnings = 0;

        if (a === b && b === c) {
            winnings = betAmount * 3;
        } else if (a === b || b === c || a === c) {
            winnings = betAmount * 2;
        } else {
            winnings = -betAmount;
        }

        let resultMessage = '';
        if (winnings > 0) {
            user.money += winnings;
            user.wins += 1;
            resultMessage = `và thắng ${winnings} xu!`;
        } else {
            user.money -= betAmount;
            user.losses += 1;
            resultMessage = `và thua ${betAmount} xu.`;
        }

        await user.save();

        await msg.edit(`**  \`___SLOTS___\`**\n\` \` ${slots.join(' ')} \` \` ${displayName} cược ${betAmount} xu\n  \`|         |\`  ${resultMessage}\n  \`|         |\``);
    },
};
