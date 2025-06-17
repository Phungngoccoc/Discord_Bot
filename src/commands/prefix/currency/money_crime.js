const User = require('../../../model/userModel');

module.exports = {
    name: 'crime',
    description: '🎰 Thử vận may với việc phạm tội (có thể mất tiền)',
    execute: async (message) => {
        const userId = message.author.id;
        const now = Date.now();
        const cooldownTime = 6 * 60 * 60 * 1000;

        try {
            let user = await User.findOne({ userId });
            if (!user) {
                user = new User({ userId, money: 1000, lastCrime: 0 });
            }

            if (now - user.lastCrime < cooldownTime) {
                const remainingTime = cooldownTime - (now - user.lastCrime);
                const hours = Math.floor(remainingTime / (60 * 60 * 1000));
                const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
                return message.reply(`⏳ Bạn phải mất ${hours} giờ ${minutes} phút nữa để lên kế hoạch phạm tội!`);
            }

            const chance = Math.random();
            const amount = Math.floor(Math.random() * (1000 - 500 + 1)) + 500; 

            if (chance < 0.5) {
                user.money += amount;
                message.reply(`Bạn đi ăn trộm và kiếm được ${amount} coin!`);
            } else {
                user.money -= amount;
                message.reply(`Bạn bị bắt khi đi ăn trộm và mất ${amount} coin!`);
            }

            user.lastCrime = now;
            await user.save();
        } catch (error) {
            console.error('Lỗi khi xử lý crime:', error);
            message.reply('Đã xảy ra lỗi khi thử vận may phạm tội.');
        }
    }
};
