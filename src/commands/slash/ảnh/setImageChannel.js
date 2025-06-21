const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setImageChannel } = require('../../../service/imageChannelService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setimagechannel')
        .setDescription('Đặt kênh để bot gửi ảnh khi ai đó nhắn "image"')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Yêu cầu quyền admin
    category: 'admin',

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const channelId = interaction.channel.id;

        try {
            await setImageChannel(guildId, channelId);
            return interaction.reply(`Đã đặt kênh gửi ảnh là <#${channelId}>.`);
        } catch (err) {
            console.error('Lỗi khi đặt image channel:', err);
            return interaction.reply({
                content: 'Có lỗi xảy ra khi lưu kênh.',
                flags: 64
            });
        }
    }
};
