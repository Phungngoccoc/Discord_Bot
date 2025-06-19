const wordGameManager = require('../../../utils/wordGameManager');
const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    name: 'start',
    description: 'Bắt đầu game nối từ',

    execute: async (message) => {
        const guildId = message.guild.id;
        const channelId = message.channel.id;

        const config = await GuildConfig.findOne({ guildId });
        if (!config || config.wordGameChannelId !== channelId) return;

        wordGameManager.startGame(channelId); // luôn gọi lại để reset
        return message.channel.send('Trò chơi đã được **khởi động lại**! Hãy nhập từ đầu tiên.');
    }

};
