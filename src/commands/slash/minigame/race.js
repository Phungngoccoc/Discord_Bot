const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} = require('discord.js');
const { getUserData, updateUserData } = require('../../../service/userService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('race')
        .setDescription('Đua xe hoặc đua ngựa! Cược tiền vào người thắng.')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('Số tiền cược')
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const userData = await getUserData(userId);
        const betAmount = interaction.options.getInteger('bet');

        if (betAmount <= 0) {
            return interaction.reply({ content: '⚠️ Vui lòng nhập số tiền hợp lệ để đặt cược!', flags: 64 });
        } else if (betAmount > userData.money) {
            return interaction.reply({ content: '💸 Bạn không đủ tiền để đặt cược!', flags: 64 });
        }

        const racers = [
            { name: 'Tay đua A: 🚗', emoji: '🚗' },
            { name: 'Tay đua B: 🏎', emoji: '🏎' },
            { name: 'Tay đua C: 🐎', emoji: '🐎' },
        ];

        let track = racers.map(racer => `${racer.name} |`);

        const row = new ActionRowBuilder().addComponents(
            racers.map((racer, index) =>
                new ButtonBuilder()
                    .setCustomId(`bet_${index}`)
                    .setLabel(racer.name)
                    .setStyle(ButtonStyle.Primary)
            )
        );

        const embed = new EmbedBuilder()
            .setColor('#ffcc00')
            .setTitle('🏁 Cuộc đua sắp bắt đầu!')
            .setDescription(`Chọn tay đua để đặt cược **${betAmount} xu** bằng cách nhấn vào nút bên dưới!`)
            .addFields({ name: 'Đường đua', value: track.join('\n') })
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
        const msg = await interaction.fetchReply();

        let userChoice;

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === userId,
            time: 15000,
        });

        collector.on('collect', async (i) => {
            userChoice = parseInt(i.customId.split('_')[1]);
            await i.update({
                content: `Bạn đã đặt cược **${betAmount}** vào **${racers[userChoice].name}**!`,
                components: [],
                embeds: [],
            });
        });

        collector.on('end', async () => {
            if (userChoice === undefined) {
                return interaction.editReply({ content: '⏱ Bạn không chọn tay đua nào! Lệnh bị hủy.', components: [], embeds: [] });
            }

            let positions = [0, 0, 0];
            let raceFinished = false;

            async function updateRace() {
                if (raceFinished) return;

                positions = positions.map(pos => pos + Math.floor(Math.random() * 3));
                track = racers.map((racer, index) => `${racer.name} ${racer.emoji.repeat(positions[index])}`);

                embed.setFields({ name: 'Đường đua', value: track.join('\n') });
                await msg.edit({ embeds: [embed] });

                if (Math.max(...positions) >= 10) {
                    raceFinished = true;
                    const winnerIndex = positions.indexOf(Math.max(...positions));
                    const winner = racers[winnerIndex].name;

                    const won = userChoice === winnerIndex;
                    const resultText = won
                        ? `Bạn đã thắng và nhận được **${betAmount * 2} xu**!`
                        : `Bạn đã thua và mất **${betAmount} xu**!`;

                    embed.setDescription(`🏁 **${winner} đã về đích đầu tiên!**\n${resultText}`);
                    await msg.edit({ embeds: [embed] });

                    const userData = await getUserData(userId);
                    await updateUserData(userId, {
                        money: userData.money + (won ? betAmount : -betAmount),
                    });
                } else {
                    setTimeout(updateRace, 300);
                }
            }

            updateRace();
        });
    },
};
