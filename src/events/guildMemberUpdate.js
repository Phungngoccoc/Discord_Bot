const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../model/guildConfig');
const moment = require('moment-timezone');

module.exports = async (oldMember, newMember) => {
    if (oldMember.premiumSince || !newMember.premiumSince) return;

    const config = await GuildConfig.findOne({ guildId: newMember.guild.id });
    if (!config || !config.boostChannelId || !config.boostEmbed) return;

    const channel = newMember.guild.channels.cache.get(config.boostChannelId);
    if (!channel) return;

    const { title, description, image, footer, color } = config.boostEmbed;

    const parsedTitle = title?.replace(/<@user>/g, `<@${newMember.user.id}>`) || '';
    const parsedDescription = description?.replace(/<@user>/g, `<@${newMember.user.id}>`) || '';

    const embed = new EmbedBuilder()
        .setColor(color || '#ff73fa')
        .setTitle(parsedTitle)
        .setDescription(parsedDescription)
        .setAuthor({
            name: newMember.user.username,
            iconURL: newMember.user.displayAvatarURL()
        })
        .setThumbnail(newMember.user.displayAvatarURL({ extension: 'png', size: 512 }));

    const now = moment().tz('Asia/Ho_Chi_Minh');
    const memberCount = newMember.guild.memberCount;
    const footerText = `Server của chúng ta còn ${memberCount} members • Hôm nay lúc ${now.format('h:mm A')}`;

    embed.setFooter({ text: footer || footerText });
    if (image) embed.setImage(image);

    channel.send({ embeds: [embed] }).catch(console.error);
};
