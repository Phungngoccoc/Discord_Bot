const mongoose = require('mongoose');
const User = require('../model/userModel'); // Giả sử bạn đã có model User

module.exports = {
    name: 'money',
    description: '💰 Xem số tiền của bạn!',
    execute: async (message) => {
        const userId = message.author.id;

        try {
            let user = await User.findOne({ userId });

            // Nếu user chưa có trong DB, tạo mới với 1000 coin
            if (!user) {
                user = new User({ userId, money: 1000, wins: 0, losses: 0, gameInProgress: false });
                await user.save();
            }

            message.reply(`💰 **Số tiền của bạn:** ${user.money} coin`);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu người dùng:', error);
            message.reply('⚠ Đã xảy ra lỗi khi lấy số tiền của bạn.');
        }
    }
};
