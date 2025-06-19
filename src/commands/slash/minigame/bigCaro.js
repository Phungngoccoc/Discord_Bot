const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bigcaro')
        .setDescription('Chơi cờ caro 5x5 với bạn bè! Điều kiện thắng: 4 ô liên tiếp.'),

    async execute(interaction) {
        await interaction.deferReply();

        const size = 5;
        const winCondition = 4;
        const board = Array(size * size).fill(null);
        let currentPlayer = 'X';
        const players = { X: interaction.user, O: null };

        const embed = new EmbedBuilder()
            .setTitle("🎮 Cờ caro 5x5")
            .setDescription(`Lượt đi của: ${players.X.tag} (X)`)
            .setColor(0x00AE86);

        const createBoard = () => {
            const rows = [];
            for (let i = 0; i < size; i++) {
                const row = new ActionRowBuilder();
                for (let j = 0; j < size; j++) {
                    const idx = i * size + j;
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`caro_${idx}`)
                            .setLabel(board[idx] ? board[idx] : '⬜')
                            .setStyle(board[idx] ? ButtonStyle.Secondary : ButtonStyle.Primary)
                            .setDisabled(!!board[idx])
                    );
                }
                rows.push(row);
            }
            return rows;
        };

        const gameMessage = await interaction.editReply({
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
            time: 5 * 60 * 1000 // 5 phút
        });

        collector.on('collect', async (btnInteraction) => {
            const idx = parseInt(btnInteraction.customId.split('_')[1]);

            if (board[idx]) return;

            if (btnInteraction.user.id !== players[currentPlayer].id) {
                return btnInteraction.reply({ content: "Không phải lượt của bạn!", flags: 64 });
            }

            board[idx] = currentPlayer;
            const winner = checkWinner(idx);

            if (winner) {
                embed.setDescription(`Người thắng: ${players[winner].tag} (${winner})`);
                collector.stop("winner");
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                embed.setDescription(`Lượt đi của: ${players[currentPlayer]?.tag || 'Chờ'} (${currentPlayer})`);
            }

            await btnInteraction.update({
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

        function checkWinner(index) {
            const directions = [
                [1, -1],           // ngang
                [size, -size],     // dọc
                [size + 1, -(size + 1)], // chéo phải
                [size - 1, -(size - 1)]  // chéo trái
            ];

            for (const [dir1, dir2] of directions) {
                let count = 1;
                count += countConsecutive(index, dir1);
                count += countConsecutive(index, dir2);
                if (count >= winCondition) return board[index];
            }
            return null;
        }

        function countConsecutive(index, direction) {
            let count = 0;
            let i = index + direction;
            while (i >= 0 && i < board.length && board[i] === board[index]) {
                if (direction === 1 || direction === -1) {
                    if (Math.floor(i / size) !== Math.floor((i - direction) / size)) break;
                }
                count++;
                i += direction;
            }
            return count;
        }
    }
};
