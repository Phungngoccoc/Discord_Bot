const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../model/guildConfig');

function parsePlaceholders(text, member) {
    const guild = member.guild;

    return text
        // .replace(/<@user>/g, `<@${member.user.id}>`)
        .replace(/<@user>/g, `${member.user.globalName || member.user.username}`);
}

module.exports = async (client, member) => {
    console.log("📥 Thành viên mới:", member.user.tag);

    const config = await GuildConfig.findOne({ guildId: member.guild.id });
    if (!config || !config.welcomeChannelId || !config.welcomeEmbed) {
        console.log("⚠️ Thiếu config chào mừng hoặc channel");
        return;
    }

    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (!channel) {
        console.log("⚠️ Không tìm thấy kênh welcome:", config.welcomeChannelId);
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
    if (image) embed.setImage(image);

    channel.send({ embeds: [embed] }).catch(console.error);
};
