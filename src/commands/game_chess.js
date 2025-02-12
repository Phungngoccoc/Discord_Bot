const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, ModalBuilder } = require('discord.js');
const axios = require('axios');

const LICHESS_TOKEN = process.env.LICHESS_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chess')
        .setDescription('Chơi cờ vua với AI trên Discord'),

    async execute(interaction) {
        try {
            // Tạo ván đấu với AI
            const response = await axios.post(
                'https://lichess.org/api/challenge/ai',
                { level: 3, rated: false, clock: { limit: 300, increment: 0 } },
                {
                    headers: {
                        'Authorization': `Bearer ${LICHESS_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const gameId = response.data.id;
            const gameUrl = `https://lichess.org/${gameId}`;
            const boardImg = `https://lichess.org/game/export/png/${gameId}`; // Ảnh bàn cờ

            // Embed hiển thị bàn cờ
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('♟️ Trận đấu cờ vua với AI')
                .setDescription(`Bạn đang đấu với AI!  
                👉 [Nhấn vào đây để xem trên Lichess](${gameUrl})`)
                .setImage(boardImg)
                .setTimestamp();

            // Gửi nút nhập nước đi
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`make_move_${gameId}`)
                    .setLabel('Nhập nước đi')
                    .setStyle(ButtonStyle.Primary)
            );

            await interaction.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Lỗi tạo ván cờ:', error);
            await interaction.reply('⚠️ Lỗi khi tạo trận đấu với AI! Hãy thử lại sau.');
        }
    },

    async handleButton(interaction) {
        if (interaction.customId.startsWith('make_move_')) {
            const gameId = interaction.customId.replace('make_move_', '');

            // Hiển thị modal để nhập nước đi
            const modal = new ModalBuilder()
                .setCustomId(`submit_move_${gameId}`)
                .setTitle('Nhập nước đi')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('move_input')
                            .setLabel('Nhập nước đi (ví dụ: e2e4)')
                            .setStyle('Short')
                    )
                );

            await interaction.showModal(modal);
        }
    },

    async handleModal(interaction) {
        if (interaction.customId.startsWith('submit_move_')) {
            const gameId = interaction.customId.replace('submit_move_', '');
            const move = interaction.fields.getTextInputValue('move_input');

            try {
                // Gửi nước đi lên Lichess
                await axios.post(
                    `https://lichess.org/api/board/game/${gameId}/move/${move}`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${LICHESS_TOKEN}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                // Cập nhật ảnh bàn cờ
                const boardImg = `https://lichess.org/game/export/png/${gameId}`;
                const gameUrl = `https://lichess.org/${gameId}`;

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('♟️ Trận đấu cờ vua với AI')
                    .setDescription(`Bạn đang đấu với AI!  
                    👉 [Nhấn vào đây để xem trên Lichess](${gameUrl})`)
                    .setImage(boardImg)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Lỗi khi thực hiện nước đi:', error);
                await interaction.reply('⚠️ Nước đi không hợp lệ hoặc có lỗi xảy ra!');
            }
        }
    },
};
