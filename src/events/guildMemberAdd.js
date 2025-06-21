const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const GuildConfig = require('../model/guildConfig');
const path = require('path');
const fs = require('fs');

function parsePlaceholders(text, member) {
    return text
        .replace(/<@user>/g, `${member.user.globalName || member.user.username}`);
}

module.exports = async (client, member) => {
    console.log("📥 Thành viên mới:", member.user.tag);

    const config = await GuildConfig.findOne({ guildId: member.guild.id });
    if (!config || !config.welcomeChannelId || !config.welcomeEmbed) {
        console.log("Thiếu config chào mừng hoặc channel");
        return;
    }

    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (!channel) {
        console.log("Không tìm thấy kênh welcome:", config.welcomeChannelId);
        return;
    }

    const { title, description, image, footer, color } = config.welcomeEmbed;
    const parsedTitle = parsePlaceholders(title || '', member);
    const parsedDescription = parsePlaceholders(description || '', member);
    const parsedFooter = parsePlaceholders(footer || '', member);

    const embed = new EmbedBuilder()
        .setTitle(parsedTitle)
        .setDescription(parsedDescription)
        .setAuthor({
            name: member.user.globalName || member.user.username,
            iconURL: member.user.displayAvatarURL()
        });

    try {
        embed.setColor(color || '#FFC0CB');
    } catch {
        embed.setColor('#FFC0CB');
    }

    if (footer) embed.setFooter({ text: parsedFooter });

    const files = [];

    if (image) {
        const filePath = path.join(__dirname, '../assets/welcome', image);
        if (fs.existsSync(filePath)) {
            embed.setImage(`attachment://${image}`);
            files.push(new AttachmentBuilder(filePath, { name: image }));
        } else {
            console.warn('File ảnh không tồn tại:', filePath);
        }
    }

    channel.send({ embeds: [embed], files }).catch(console.error);
};
