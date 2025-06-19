const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../../../service/userService');

module.exports = {
    name: 'race',
    description: '🚗 Đua xe hoặc đua ngựa! Cược tiền vào người thắng.',
    execute: async (message, args) => {
        const userId = message.author.id;
        const userData = await getUserData(userId);
        const betAmount = args.length > 0 && !isNaN(args[0]) ? parseInt(args[0]) : 1;
        if (betAmount <= 0) {
            return message.reply('Vui lòng nhập số tiền hợp lệ để đặt cược!');
        } else if (betAmount > userData.money) {
            return message.reply('Bạn không đủ tiền để đặt cược!');
        }

        const racers = [
            { name: 'Tay đua A: 🚗 ', emoji: '🚗' },
            { name: 'Tay đua B: 🏎 ', emoji: '🏎' },
            { name: 'Tay đua C: 🐎 ', emoji: '🐎' }
        ];
        let track = racers.map(racer => ` ${racer.name} |`);

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
            .setDescription(`Chọn tay đua mà bạn muốn đặt cược (số tiền cược: ${betAmount}!) bằng cách nhấn vào nút bên dưới!`)
            .addFields({ name: 'Đường đua', value: track.join('\n') })
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });

        let msg = await message.reply({ embeds: [embed], components: [row] });

        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

        let userChoice;

        collector.on('collect', async (interaction) => {
            userChoice = parseInt(interaction.customId.split('_')[1]);
            await interaction.update({ content: `Bạn đã đặt cược ${betAmount} vào ** ${racers[userChoice].name} **!`, components: [] });
        });

        collector.on('end', async () => {
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
                    let winnerIndex = positions.indexOf(Math.max(...positions));
                    let winner = racers[winnerIndex].name;
                    let resultMessage = userChoice === winnerIndex ? `Bạn đã thắng và nhận ${betAmount * 2}!` : `Bạn đã thua!`;
                    embed.setDescription(`🏁 ${winner} đã về đích trước!\n${resultMessage}`);
                    await msg.edit({ embeds: [embed] });

                    if (userChoice === winnerIndex) {
                        const userData = await getUserData(userId);
                        await updateUserData(userId, { money: userData.money + betAmount });
                    } else {
                        const userData = await getUserData(userId);
                        await updateUserData(userId, { money: userData.money - betAmount });
                    }
                } else {
                    setTimeout(updateRace, 200);
                }
            }

            updateRace();
        });
    }
};
