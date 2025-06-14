const User = require('../../../model/userModel');

module.exports = {
    name: 'money',
    description: '💰 Xem số tiền của bạn hoặc của người khác!',
    execute: async (message) => {
        const mention = message.mentions.users.first();
        const targetId = mention ? mention.id : message.author.id; // Nếu tag ai đó, lấy ID của họ, nếu không thì lấy ID của người gửi
        const targetUsername = mention ? mention.username : message.author.username;

        try {
            let user = await User.findOne({ userId: targetId });

            // Nếu user chưa có trong DB, tạo mới với 1000 coin
            if (!user) {
                user = new User({ userId: targetId, money: 1000, wins: 0, losses: 0, gameInProgress: false });
                await user.save();
            }

            message.reply(`💰 **Số tiền của ${targetUsername} là ** ${user.money} coin`);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu người dùng:', error);
            message.reply('⚠ Đã xảy ra lỗi khi lấy số tiền.');
        }
    }
};
