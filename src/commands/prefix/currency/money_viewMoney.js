const User = require('../../../model/userModel');

module.exports = {
    name: 'money',
    description: '💰 Xem số tiền của bạn hoặc của người khác!',
    execute: async (message) => {
        const mention = message.mentions.users.first();
        const targetId = mention ? mention.id : message.author.id; 
        const targetUsername = mention ? mention.username : message.author.username;

        try {
            let user = await User.findOne({ userId: targetId });

            if (!user) {
                user = new User({ userId: targetId, money: 1000, wins: 0, losses: 0, gameInProgress: false });
                await user.save();
            }

            message.reply(`**Số tiền của ${targetUsername} là ** ${user.money} coin`);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu người dùng:', error);
            message.reply('Đã xảy ra lỗi khi lấy số tiền.');
        }
    }
};
