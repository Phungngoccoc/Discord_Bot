const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    name: 'setupchannel',
    description: 'Thiết lập kênh chơi game nối từ',

    execute: async (message) => {
        try {
            const guildId = message.guild.id;
            const channelId = message.channel.id;

            await GuildConfig.findOneAndUpdate(
                { guildId },
                { guildId, wordGameChannelId: channelId },
                { upsert: true, new: true }
            );

            await message.reply(`✅ Kênh này đã được thiết lập làm kênh chơi game nối từ.`);
        } catch (error) {
            console.error('Lỗi khi setup channel:', error);
            await message.reply('❌ Có lỗi xảy ra khi thiết lập.');
        }
    }
};