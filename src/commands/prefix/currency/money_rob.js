const User = require('../../../model/userModel');

module.exports = {
    name: 'rob',
    description: '💰 Cướp tiền từ người khác (nếu thất bại thì mất tiền gấp đôi)',
    execute: async (message) => {
        const userId = message.author.id;
        const mention = message.mentions.users.first();

        if (!mention) {
            return message.reply('Vui lòng tag người mà bạn muốn cướp tiền!');
        }

        const targetId = mention.id;
        if (userId === targetId) {
            return message.reply('Bạn không thể cướp tiền chính mình!');
        }

        try {
            let user = await User.findOne({ userId });
            let target = await User.findOne({ userId: targetId });

            if (!user || !target) {
                return message.reply('Người chơi chưa tồn tại trong hệ thống!');
            }

            const now = Date.now();
            const cooldownTime = 12 * 60 * 60 * 1000;
            if (now - user.lastRob < cooldownTime) {
                const remainingTime = cooldownTime - (now - user.lastRob);
                const hours = Math.floor(remainingTime / (60 * 60 * 1000));
                const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
                return message.reply(`Bạn phải mất ${hours} giờ ${minutes} để lên kế hoạch cướp tiền!`);
            }

            const chance = Math.random();
            const amount = Math.floor(Math.random() * (500 - 200 + 1)) + 200;

            if (chance < 0.5) { 
                if (target.money >= amount) {
                    user.money += amount;
                    target.money -= amount;
                    message.reply(`Bạn đã cướp thành công ${amount} coin từ <@${targetId}>!`);
                } else {
                    user.money += target.money;
                    message.reply(`Bạn đã cướp thành công ${target.money} coin từ <@${targetId}>, vì họ không có đủ tiền!`);
                    target.money = 0;
                }
            } else { 
                const penalty = amount * 2;

                if (user.money >= penalty) {
                    user.money -= penalty;
                    message.reply(`Bạn bị cảnh sát bắt và mất ${penalty} coin!`);
                } else {
                    user.money = 0; 
                    message.reply(`Bạn bị cảnh sát bắt! Bạn không có đủ ${penalty} coin nên bị mất toàn bộ số tiền hiện có!`);
                }
            }

            user.lastRob = now;
            await user.save();
            await target.save();
        } catch (error) {
            console.error('Lỗi khi xử lý rob:', error);
            message.reply('Đã xảy ra lỗi khi thực hiện cướp tiền.');
        }
    }
};
