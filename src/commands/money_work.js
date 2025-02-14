const User = require('../model/userModel');

module.exports = {
    name: 'work',
    description: '💼 Kiếm tiền mỗi 6 giờ!',
    execute: async (message) => {
        const userId = message.author.id;
        const now = Date.now();
        const cooldown = 6 * 60 * 60 * 1000; // 6 giờ
        const reward = Math.floor(Math.random() * (500 - 200 + 1)) + 200; // Ngẫu nhiên từ 200 đến 500 coin

        try {
            let user = await User.findOne({ userId });

            // Nếu user chưa có trong DB, tạo mới
            if (!user) {
                user = new User({ userId, money: 1000, wins: 0, losses: 0, gameInProgress: false, lastWorked: 0 });
            }

            // Kiểm tra cooldown
            if (user.lastWorked && now - user.lastWorked < cooldown) {
                const remainingTime = cooldown - (now - user.lastWorked);
                const hours = Math.floor(remainingTime / (60 * 60 * 1000));
                const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
                return message.reply(`⏳ Bạn cần nghỉ ngơi ${hours} giờ ${minutes} phút nữa để làm việc lại!`);
            }

            // Cập nhật tiền và thời gian làm việc
            user.money += reward;
            user.lastWorked = now;
            await user.save();

            message.reply(`💼 Bạn đã làm việc và nhận được ${reward} coin! Tổng số tiền: ${user.money} coin.`);
        } catch (error) {
            console.error('Lỗi khi cập nhật tiền:', error);
            message.reply('⚠ Đã xảy ra lỗi khi nhận tiền.');
        }
    }
};
