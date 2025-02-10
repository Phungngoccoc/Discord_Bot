module.exports = {
    name: 'duel',
    description: '🔫 Thách đấu bắn súng với người khác!',
    execute: async (message, args) => {
        const opponent = message.mentions.users.first();
        if (!opponent) return message.reply('⚠ Hãy tag người bạn muốn đấu súng!');

        const winner = Math.random() < 0.5 ? message.author : opponent;
        message.channel.send(`🔫 **${message.author.username}** đấu với **${opponent.username}**...\n💥 **${winner.username}** đã bắn trúng!`);
    }
};
