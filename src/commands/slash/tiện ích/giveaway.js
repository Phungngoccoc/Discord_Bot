const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Tạo một giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt =>
            opt.setName('description').setDescription('Mô tả quà tặng').setRequired(true))
        .addIntegerOption(opt =>
            opt.setName('winner').setDescription('Số người thắng').setRequired(true))
        .addStringOption(opt =>
            opt.setName('time').setDescription('Thời gian (vd: 10s, 5m, 1h)').setRequired(true)),

    async execute(interaction) {
        const description = interaction.options.getString('description');
        const winnerCount = interaction.options.getInteger('winner');
        const timeStr = interaction.options.getString('time');
        const duration = ms(timeStr);

        if (!duration || duration < 10000) {
            return interaction.reply({ content: '❌ Thời gian không hợp lệ.', flags: 64 });
        }
        const endTime = Math.floor((Date.now() + duration) / 1000);
        const embed = new EmbedBuilder()
            .setDescription(`**${description}**\n\n<a:beer:1385891025251336242> Nhấn vào<a:pong:1385890861128089680> để tham gia\n<:star:1385891056318550127> Số người chiến thắng: ${winnerCount}\n<:start:1385891056318550127> Đếm ngược: **<t:${endTime}:R>**\n<:star:1385891056318550127> Tổ chức bởi: <@${interaction.user.id}>`)
            .setColor('#FF69B4')
            .setFooter({ text: `Tổ chức bởi ${interaction.user.tag}`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            })
            .setThumbnail(interaction.user.displayAvatarURL({ extension: 'png', size: 512 }))
            .setTimestamp();

        const giveawayMsg = await interaction.reply({ content: '<a:tail1:1385891007068901376> **GIVEAWAY BẮT ĐẦU** <a:tail2:1385890899334135918>', embeds: [embed], fetchReply: true });
        await giveawayMsg.react('<a:pong:1385890861128089680>');

        // Chờ hết thời gian
        setTimeout(async () => {
            const fetched = await giveawayMsg.fetch();
            const reaction = fetched.reactions.cache.find(r => r.emoji.id === '1385890861128089680');
            if (!reaction) {
                return console.log('Không tìm thấy reaction emoji!');
            }
            const usersReacted = await reaction.users.fetch();
            const validUsers = usersReacted.filter(u => !u.bot);
            const winners = [];
            const entries = Array.from(validUsers.values());

            if (entries.length === 0) {
                return fetched.reply('Không có ai tham gia giveaway.');
            }

            const maxWinners = Math.min(winnerCount, entries.length);
            while (winners.length < maxWinners) {
                const winner = entries.splice(Math.floor(Math.random() * entries.length), 1)[0];
                winners.push(winner);
            }

            const winnerMentions = winners.map(w => `<@${w.id}>`).join(', ');

            const updatedEmbed = EmbedBuilder.from(embed)
                .setFooter({ text: `Kết thúc vào`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) }).setTimestamp()
                .setDescription(`**${description}**\n\n<:star:1385891056318550127> Người thắng: ${winnerMentions}\n <:star:1385891056318550127> Tổ chức bởi <@${interaction.user.id}> `);

            await fetched.edit({ content: '<a:pong:1385890861128089680> **GIVEAWAY ĐÃ KẾT THÚC** <a:pong:1385890861128089680>', embeds: [updatedEmbed] });
            await fetched.reply(`<a:gift:1385891045606166538> | Xin chúc mừng, ${winnerMentions} đã trúng giveaways ** ${description} ** tổ chức bởi <@${interaction.user.id}> `);
        }, duration);
    }
};