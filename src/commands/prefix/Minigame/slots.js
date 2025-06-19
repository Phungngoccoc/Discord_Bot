const User = require('../../../model/userModel');

module.exports = {
    name: 'slot',
    description: '🎰 Chơi máy đánh bạc với hiệu ứng quay và đặt cược!',
    execute: async (message) => {
        if (message.content.includes('help')) {
            return message.reply(`📜 **Hướng dẫn chơi Slot** 📜\n\n🎰 **Cách chơi:**\n- Nhập lệnh \`kslot <số tiền cược>\` để quay máy đánh bạc.\n\n💰 **Tỷ lệ thắng:**\n- 2 biểu tượng trùng: Thắng x2 tiền cược\n- 3 biểu tượng trùng: Thắng x3 tiền cược\n- Khác nhau: Thua hết tiền cược\n\nChúc bạn may mắn! 🍀`);
        }

        const symbols = [
            '<:slots1:1338720715054256168>',
            '<:slots2:1338720717323239494>',
            '<:slots6:1338720727322595498>',
            '<:slots5:1338720724864602253>',
            '<:slots3:1338720719345029164>',
            '<:slots4:1338721143267262524>',
        ];
        const loadingIcon = '<a:slot:1338518091973263443>';
        const username = message.author?.globalName || message.author.username;
        ;
        const match = message.content.match(/\d+/);
        let betAmount = match && !isNaN(match[0]) ? parseInt(match[0]) : 1;

        const userId = message.author.id;
        let user = await User.findOne({ userId });

        if (!user) {
            user = new User({ userId, money: 1000, wins: 0, losses: 0 });
            await user.save();
        }

        if (betAmount <= 0 || betAmount > user.money) {
            return message.reply(`Số tiền cược không hợp lệ! Bạn chỉ có ${user.money} xu.`);
        }

        let slots = [null, null, null];

        let msg = await message.reply(` **  \`___SLOTS___\`**\n\` \` ${loadingIcon} ${loadingIcon} ${loadingIcon} \` \` ${username} cược ${betAmount} xu\n  \`|         |\`\n  \`|         |\``);

        const spinSlot = () => symbols[Math.floor(Math.random() * symbols.length)];

        for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 800));
            slots[i] = spinSlot();

            const display = slots.map(s => s || loadingIcon).join(' ');
            await msg.edit(` **  \`___SLOTS___\`**\n\` \` ${display} \` \` ${username} cược ${betAmount} xu\n  \`|         |\`\n  \`|         |\``);
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

        await msg.edit(` **  \`___SLOTS___\`**\n\` \` ${slots.join(' ')} \` \` ${username} cược ${betAmount} xu\n  \`|         |\`  ${resultMessage}\n  \`|         |\``);
    }
};
