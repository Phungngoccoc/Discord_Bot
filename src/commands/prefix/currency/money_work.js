const User = require('../../../model/userModel');

module.exports = {
    name: 'work',
    description: '💼 Kiếm tiền mỗi 6 giờ!',
    execute: async (message) => {
        const userId = message.author.id;
        const now = Date.now();
        const cooldown = 6 * 60 * 60 * 1000;
        const reward = Math.floor(Math.random() * (500 - 200 + 1)) + 200;

        try {
            let user = await User.findOne({ userId });

            if (!user) {
                user = new User({ userId, money: 1000, wins: 0, losses: 0, gameInProgress: false, lastWorked: 0 });
            }

            if (user.lastWorked && now - user.lastWorked < cooldown) {
                const remainingTime = cooldown - (now - user.lastWorked);
                const hours = Math.floor(remainingTime / (60 * 60 * 1000));
                const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
                return message.reply(`Bạn cần nghỉ ${hours} giờ ${minutes} phút nữa để làm việc lại!`);
            }

            user.money += reward;
            user.lastWorked = now;
            await user.save();

            message.reply(`Bạn đi làm và nhận được ${reward} coin! Tổng số tiền: ${user.money} coin.`);
        } catch (error) {
            console.error('Lỗi khi cập nhật tiền:', error);
            message.reply('Đã xảy ra lỗi khi nhận tiền.');
        }
    }
};
