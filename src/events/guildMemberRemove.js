const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const GuildConfig = require('../model/guildConfig');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
function parsePlaceholders(text, member) {
    return text.replace(/<@user>/g, `${member.user.globalName || member.user.username}`);
}

module.exports = async (client, member) => {
    console.log(`Member left: ${member.user.tag} (${member.id}) from guild: ${member.guild.name} (${member.guild.id})`);
    const config = await GuildConfig.findOne({ guildId: member.guild.id });
    if (!config || !config.goodbyeChannelId || !config.goodbyeEmbed) return;

    const channel = member.guild.channels.cache.get(config.goodbyeChannelId);
    if (!channel) return;

    const { title, description, image, footer, color } = config.goodbyeEmbed;
    const parsedTitle = parsePlaceholders(title || '', member);
    const parsedDescription = parsePlaceholders(description || '', member);
    const parsedFooter = parsePlaceholders(footer || '', member);

    const embed = new EmbedBuilder()
        .setTitle(parsedTitle)
        .setDescription(parsedDescription)
        .setColor(color || '#ff5050')
        .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 512 }))
        .setAuthor({
            name: member.user.globalName || member.user.username,
            iconURL: member.user.displayAvatarURL()
        });
    const now = moment().tz('Asia/Ho_Chi_Minh');
    const memberCount = member.guild.memberCount;
    const footerText = `Server của chúng ta còn ${memberCount} members • Hôm nay lúc ${now.format('h:mm A')}`;

    if (footer) {
        embed.setFooter({ text: parsedFooter });
    } else {
        embed.setFooter({ text: footerText });
    }

    const files = [];
    if (image) {
        const filePath = path.join(__dirname, `../assets/goodbye/${image}`);
        embed.setImage(`attachment://${image}`);
        if (fs.existsSync(filePath)) files.push(new AttachmentBuilder(filePath, { name: image }));
    }

    channel.send({ embeds: [embed], files }).catch(console.error);
};
