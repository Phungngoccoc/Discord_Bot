const GuildConfig = require('../../../model/guildConfig');

module.exports = {
    name: 'setwelcomechannel',
    description: 'Thiết lập kênh chào mừng cho server',

    execute: async (message) => {
        const guildId = message.guild.id;
        const channelId = message.channel.id;

        let config = await GuildConfig.findOne({ guildId });

        if (!config) {
            config = new GuildConfig({ guildId });
        }

        config.welcomeChannelId = channelId;
        await config.save();

        message.reply(`✅ Đã thiết lập kênh chào mừng là <#${channelId}>`);
    }
};
