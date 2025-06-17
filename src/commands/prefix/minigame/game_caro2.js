const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    name: 'caro',
    description: 'Chơi cờ caro (tic-tac-toe) với bạn bè!',
    execute: async (message) => {
        console.log(`[DEBUG] Nhận command: !caro từ ${message.author.tag}`);

        const board = Array(9).fill(null);
        let currentPlayer = 'X';
        const players = { X: message.author, O: null };

        const embed = new EmbedBuilder()
            .setTitle("🎮 Cờ caro")
            .setDescription(`Lượt đi của: ${players.X.tag} (X)`)
            .setColor(0x00AE86);

        const createBoard = () => {
            const rows = [];
            for (let i = 0; i < 3; i++) {
                const row = new ActionRowBuilder();
                for (let j = 0; j < 3; j++) {
                    const idx = i * 3 + j;
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(idx.toString())
                            .setLabel(board[idx] ? board[idx] : '⬜')
                            .setStyle(board[idx] ? ButtonStyle.Secondary : ButtonStyle.Primary)
                            .setDisabled(!!board[idx])
                    );
                }
                rows.push(row);
            }
            return rows;
        };

        const gameMessage = await message.channel.send({
            content: `🎲 Trò chơi bắt đầu!`,
            embeds: [embed],
            components: createBoard()
        });

        const collector = gameMessage.createMessageComponentCollector({
            filter: (i) => {
                if (!players.O && i.user.id !== players.X.id) {
                    players.O = i.user;
                    console.log(`[INFO] Người chơi O: ${players.O.tag}`);
                }
                return i.user.id === players.X.id || i.user.id === players.O?.id;
            },
            time: 60000
        });

        collector.on('collect', async (buttonInteraction) => {
            const idx = parseInt(buttonInteraction.customId);
            if (board[idx]) return;

            if (!players[currentPlayer]) {
                console.error(`[ERROR] Người chơi ${currentPlayer} chưa được xác định.`);
                return buttonInteraction.reply({
                    content: "⚠ Lỗi: Người chơi chưa được xác định!",
                    flags: 64
                });
            }

            if (buttonInteraction.user.id !== players[currentPlayer].id) {
                return buttonInteraction.reply({
                    content: "Không phải lượt của bạn!",
                    flags: 64
                });
            }

            board[idx] = currentPlayer;
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

            const winner = checkWinner();
            if (winner) {
                embed.setDescription(`🎉 Người thắng: ${players[winner].tag} (${winner})`);
                collector.stop("winner");
            } else {
                embed.setDescription(`Lượt đi của: ${players[currentPlayer]?.tag || 'Chờ'} (${currentPlayer})`);
            }

            await buttonInteraction.update({
                embeds: [embed],
                components: createBoard()
            });
        });

        collector.on('end', async (_, reason) => {
            if (reason === "winner") return;
            embed.setDescription("⏰ Trò chơi kết thúc do hết thời gian!");
            await gameMessage.edit({
                embeds: [embed],
                components: []
            });
        });

        function checkWinner() {
            const winningCombos = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];
            for (const combo of winningCombos) {
                const [a, b, c] = combo;
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    return board[a];
                }
            }
            return null;
        }
    }
};
