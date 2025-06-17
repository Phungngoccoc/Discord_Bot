const User = require('../../../model/userModel'); // Giả sử bạn có model User trong MongoDB

module.exports = {
    name: 's',
    description: '🎰 Chơi máy đánh bạc với hiệu ứng quay và đặt cược!',
    execute: async (message) => {
        if (message.content.includes('help')) {
            return message.reply(`📜 **Hướng dẫn chơi Slot** 📜\n\n🎰 **Cách chơi:**\n- Nhập lệnh \`kslot <số tiền cược>\` để quay máy đánh bạc.\n- Hệ thống sẽ quay 10 ô slot với các biểu tượng ngẫu nhiên.\n\n💰 **Tỷ lệ thắng:**\n- 2 biểu tượng trùng: Mất toàn bộ tiền cược.\n- 3 biểu tượng trùng: Hoàn lại 50% tiền cược.\n- 4 biểu tượng trùng: Thắng x1.5 tiền cược.\n- 5 biểu tượng trùng: Thắng x5 tiền cược.\n- 6 biểu tượng trùng: Thắng x10 tiền cược.\n- 7 biểu tượng trùng: Thắng x50 tiền cược.\n- 8 biểu tượng trùng: Thắng x100 tiền cược.\n- 9 biểu tượng trùng: Thắng x500 tiền cược.\n- 10 biểu tượng trùng: Thắng x1000 tiền cược.\n\nChúc bạn may mắn! 🍀`);
        }

        const symbols = ['<:slots1:1338720715054256168>', '<:slots2:1338720717323239494>', '<:slots6:1338720727322595498>', '<:slots5:1338720724864602253>', '<:slots3:1338720719345029164>', '<:slots4:1338721143267262524>'];
        // const symbols = ['<:slots1:1338720715054256168>'];
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
        let msg = await message.reply(`| ${loadingIcon} `.repeat(10) + `|
🎰 Đang quay máy đánh bạc với ${betAmount} coin...`);

        // Quay từng ô slot một
        const spinSlots = () => symbols[Math.floor(Math.random() * symbols.length)];

        let slots = new Array(10).fill(null);
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(async () => {
                slots[i] = spinSlots();
                await msg.edit(`| ${slots.map(s => s || loadingIcon).join(' | ')} |
🎰 Đang quay máy đánh bạc với ${betAmount} coin...`);
                resolve();
            }, 800));
        }

        // Đếm số lượng biểu tượng trùng nhau
        let counts = {};
        slots.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);
        let maxMatches = Math.max(...Object.values(counts));

        // Xử lý kết quả dựa trên số biểu tượng trùng nhau
        let winnings = 0;
        if (maxMatches === 2) winnings = -betAmount; // 0
        else if (maxMatches === 3) winnings = -betAmount;
        else if (maxMatches === 4) winnings = betAmount * 2;
        else if (maxMatches === 5) winnings = betAmount * 5;
        else if (maxMatches === 6) winnings = betAmount * 10;
        else if (maxMatches === 7) winnings = betAmount * 50;
        else if (maxMatches === 8) winnings = betAmount * 100;
        else if (maxMatches === 9) winnings = betAmount * 500;
        else if (maxMatches === 10) winnings = betAmount * 1000;

        let resultMessage;
        if (winnings > 0) {
            user.money += winnings;
            user.wins += 1;
            resultMessage = `🎉 Bạn trúng ${maxMatches} biểu tượng giống nhau! Thắng ${winnings} coin! 🎰🔥`;
        } else if (winnings === 0) {
            resultMessage = `🎉 Bạn trúng ${maxMatches} biểu tượng giống nhau! Hoàn lại ${betAmount} coin! 🎰🔥`;
        } else {
            betAmount = Math.ceil(betAmount);
            user.money -= betAmount;
            user.losses += 1;
            resultMessage = `❌ Bạn thua ${-1 * winnings} coin!`;
        }

        // Lưu kết quả vào database
        await user.save();

        // Gửi kết quả
        await msg.edit(`| ${slots.join(' | ')} |
${resultMessage}
💰 **Số tiền còn lại:** ${user.money} coin`);
    }
};