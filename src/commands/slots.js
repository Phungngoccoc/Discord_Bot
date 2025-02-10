const User = require('../model/userModel'); // Giả sử bạn có model User trong MongoDB

module.exports = {
    name: 'slot',
    description: '🎰 Chơi máy đánh bạc với hiệu ứng quay và đặt cược!',
    execute: async (message) => {
        const symbols = ['🍒', '🍋', '🍉', '⭐', '🍇'];

        // Lấy số tiền cược từ tin nhắn
        const match = message.content.match(/\d+/);
        let betAmount = match && !isNaN(match[0]) ? parseInt(match[0]) : 1;

        // Lấy thông tin người chơi từ database
        const userId = message.author.id;
        let user = await User.findOne({ userId });

        if (!user) {
            user = new User({ userId, money: 1000, wins: 0, losses: 0 });
            await user.save();
        }

        // Kiểm tra tiền cược hợp lệ
        if (betAmount <= 0 || betAmount > user.money) {
            return message.reply(`⚠️ Số tiền cược không hợp lệ! Bạn chỉ có ${user.money} coin.`);
        }

        // Biểu tượng đang quay
        const loadingIcon = '<a:slot:1338518091973263443>';
        let msg = await message.reply(`| ${loadingIcon} | ${loadingIcon} | ${loadingIcon} |\n🎰 Đang quay máy đánh bạc với ${betAmount} coin...`);

        // Quay từng biểu tượng một
        const spinSlots = () => symbols[Math.floor(Math.random() * symbols.length)];

        let slot1, slot2, slot3;

        await new Promise(resolve => setTimeout(async () => {
            slot1 = spinSlots();
            await msg.edit(`| ${slot1} | ${loadingIcon} | ${loadingIcon} |\n🎰 Đang quay máy đánh bạc với ${betAmount} coin...`);
            resolve();
        }, 1500));

        await new Promise(resolve => setTimeout(async () => {
            slot2 = spinSlots();
            await msg.edit(`| ${slot1} | ${slot2} | ${loadingIcon} |\n🎰 Đang quay máy đánh bạc với ${betAmount} coin...`);
            resolve();
        }, 1500));

        await new Promise(resolve => setTimeout(async () => {
            slot3 = spinSlots();
            await msg.edit(`| ${slot1} | ${slot2} | ${slot3} |\n🎰 Đang quay máy đánh bạc với ${betAmount} coin`);
            resolve();
        }, 1500));

        // Xử lý kết quả
        let resultMessage;
        if (slot1 === slot2 && slot2 === slot3) {
            // Trùng cả 3 biểu tượng → x5 tiền cược
            let winnings = betAmount * 5;
            user.money += winnings;
            user.wins += 1;
            resultMessage = `🎉 **JACKPOT!** Bạn thắng ${winnings} coin! 🎰🔥`;
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            // Trùng 2 biểu tượng → Nhận lại 50% tiền cược
            let refund = Math.floor(betAmount / 2);
            user.money -= (betAmount - refund); // Chỉ trừ 50% thay vì toàn bộ
            resultMessage = `✨ Bạn trúng 2 biểu tượng! Nhận lại ${refund} coin.`;
        } else {
            // Không trùng → Mất toàn bộ tiền cược
            user.money -= betAmount;
            user.losses += 1;
            resultMessage = `❌ Bạn thua ${betAmount} coin!`;
        }
        // Lưu kết quả vào database
        await user.save();

        // Gửi kết quả
        await msg.edit(`| ${slot1} | ${slot2} | ${slot3} |\n${resultMessage}\n💰 **Số tiền còn lại:** ${user.money} coin`);
    }
};
