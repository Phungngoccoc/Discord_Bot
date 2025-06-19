const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../model/guildConfig');

module.exports = async (client, message) => {
    if (!message.guild || message.author?.bot) return;

    const config = await GuildConfig.findOne({ guildId: message.guild.id });
    if (!config || !config.logMessageChannelId) return;

    const logChannel = message.guild.channels.cache.get(config.logMessageChannelId);
    if (!logChannel) return;

    const content = message.content || '[Không có nội dung]';

    const embed = new EmbedBuilder()
        .setColor('Red')
        .setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL(),
        })
        .setTitle('🗑 Tin nhắn đã bị xóa')
        .addFields(
            { name: 'Người gửi', value: `<@${message.author.id}>`, inline: true },
            { name: 'Kênh', value: `<#${message.channel.id}>`, inline: true },
            { name: 'Nội dung', value: content.length > 1024 ? content.slice(0, 1021) + '...' : content }
        )
        .setTimestamp();

    if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        if (attachment.contentType?.startsWith('image')) {
            embed.setImage(attachment.url);
        } else {
            embed.addFields({ name: '📎 File đính kèm', value: attachment.url });
        }
    }

    await logChannel.send({ embeds: [embed] });
};
