const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require('discord.js');
const { getUserData, updateUserData } = require('../../../service/userService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Chuyển xu cho người khác')
        .addUserOption(option =>
            option.setName('nguo_nhan')
                .setDescription('Chọn người nhận')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('so_tien')
                .setDescription('Số xu muốn chuyển')
                .setRequired(true)
        ),
    category: 'currency',

    async execute(interaction) {
        const sender = interaction.user;
        const receiver = interaction.options.getUser('nguo_nhan');
        const amount = interaction.options.getInteger('so_tien');

        if (receiver.bot) {
            return interaction.reply({ content: 'Bot không thể nhận tiền!', flags: 64 });
        }

        if (receiver.id === sender.id) {
            return interaction.reply({ content: 'Bạn không thể tự chuyển tiền cho chính mình!', flags: 64 });
        }

        if (amount <= 0 || isNaN(amount)) {
            return interaction.reply({ content: 'Vui lòng nhập số tiền hợp lệ!', flags: 64 });
        }

        const senderData = await getUserData(sender.id);
        if (!senderData || senderData.money < amount) {
            return interaction.reply({ content: 'Bạn không có đủ tiền để chuyển!', flags: 64 });
        }

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle(`${sender.username}, bạn sắp chuyển tiền cho ${receiver.username}`)
            .setDescription(`Bạn sẽ chuyển **${amount} xu** cho <@${receiver.id}>.`)
            .addFields(
                { name: 'Người gửi:', value: `<@${sender.id}>`, inline: true },
                { name: 'Người nhận:', value: `<@${receiver.id}>`, inline: true },
                { name: 'Số tiền:', value: `**${amount} xu**`, inline: false }
            )
        // .setFooter({ text: 'Nhấn ✅ để xác nhận hoặc ❌ để hủy.' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm').setLabel('Xác nhận').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('cancel').setLabel('Hủy').setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
        const replyMessage = await interaction.fetchReply();
        const filter = i =>
            ['confirm', 'cancel'].includes(i.customId) && i.user.id === sender.id;

        const collector = replyMessage.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm') {
                const updatedSender = await getUserData(sender.id);
                if (!updatedSender || updatedSender.money < amount) {
                    return i.update({
                        content: 'Giao dịch thất bại: Bạn không đủ tiền!',
                        embeds: [],
                        components: []
                    });
                }

                await updateUserData(sender.id, { money: updatedSender.money - amount });

                const receiverData = await getUserData(receiver.id);
                await updateUserData(receiver.id, {
                    money: (receiverData?.money || 0) + amount
                });

                await i.update({
                    content: `<@${sender.id}> đã chuyển **${amount} xu** cho <@${receiver.id}> thành công!`,
                    embeds: [],
                    components: []
                });
            } else {
                await i.update({
                    content: 'Giao dịch đã bị hủy!',
                    embeds: [],
                    components: []
                });
            }
        });

        collector.on('end', async () => {
            reply.edit({ components: [] }).catch(() => { });
        });
    }
};
