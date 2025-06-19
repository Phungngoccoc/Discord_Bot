// File: commands/prefix/log/setLogMessageChannel.js
const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    name: 'setlogmessagechannel',
    description: 'Cài đặt kênh dùng để log khi tin nhắn bị xóa',

    execute: async (message) => {
        const guildId = message.guild.id;
        const channelId = message.channel.id;

        let config = await GuildConfig.findOne({ guildId });

        if (!config) {
            config = new GuildConfig({ guildId, wordGameChannelId: 'unset', logMessageChannelId: channelId });
        } else {
            config.logMessageChannelId = channelId;
        }

        await config.save();
        return message.reply(`✅ Đã đặt kênh log tin nhắn bị xóa là <#${channelId}>`);
    }
};
