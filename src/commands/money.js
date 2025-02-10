const fs = require('fs');
const dataFile = './users.json';

module.exports = {
    name: 'money',
    description: '💰 Xem số tiền của bạn!',
    execute: async (message) => {
        let users = {};
        if (fs.existsSync(dataFile)) {
            users = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        }

        const userId = message.author.id;
        // Nếu chưa có dữ liệu, tự động cấp 1.000 coin
        if (!users[userId]) {
            users[userId] = { money: 1000, wins: 0, losses: 0 };
            fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
        }

        message.reply(`💰 **Số tiền của bạn:** ${users[userId].money} coin\n✅ **Thắng:** ${users[userId].wins} trận\n❌ **Thua:** ${users[userId].losses} trận`);
    }
};
