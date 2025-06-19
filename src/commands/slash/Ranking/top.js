const { SlashCommandBuilder } = require('discord.js');
const User = require('../../../model/userModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Xem bảng xếp hạng người chơi có nhiều xu nhất!'),

    async execute(interaction) {
        await interaction.deferReply(); // Tránh timeout nếu truy vấn lâu

        const topUsers = await User.find().sort({ money: -1 }).limit(5);
        const allUsers = await User.find().sort({ money: -1 });

        const authorId = interaction.user.id;
        const userRank = allUsers.findIndex(u => u.userId === authorId) + 1;
        const user = await User.findOne({ userId: authorId });

        let leaderboard = `\`\`\`\n< Top 5 Bảng Xếp Hạng Xu >\n`;
        leaderboard += `> Rank của bạn: ${userRank > 0 ? userRank : 'Chưa có'}\n`;
        leaderboard += `>     Số xu: ${user?.money?.toLocaleString() || 0}\n\n`;

        for (let i = 0; i < topUsers.length; i++) {
            const u = topUsers[i];
            let username = 'Unknown';

            try {
                const fetchedUser = await interaction.client.users.fetch(u.userId);
                username = fetchedUser.globalName || fetchedUser.username;
            } catch (err) {
                console.error(`Không lấy được tên cho userId ${u.userId}:`, err);
            }

            leaderboard += `#${i + 1}   @${username}\n       Xu: ${u.money.toLocaleString()}\n`;
        }

        leaderboard += `${new Date().toLocaleString('vi-VN')}\n\`\`\``;

        await interaction.editReply({ content: leaderboard });
    },
};
