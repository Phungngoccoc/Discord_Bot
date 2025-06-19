const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    name: 'bigcaro',
    description: 'Chơi cờ caro 5x5 với bạn bè! Điều kiện thắng: 4 ô liên tiếp.',
    execute: async (message) => {
        console.log(`[DEBUG] Nhận command: !caro từ ${message.author.tag}`);

        const size = 5;
        const winCondition = 4;
        const board = Array(size * size).fill(null);
        let currentPlayer = 'X';
        const players = { X: message.author, O: null };

        const embed = new EmbedBuilder()
            .setTitle("🎮 <a:emoji_11:1107231869063405649>  Cờ caro 5x5")
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
            time: 360000
        });

        collector.on('collect', async (buttonInteraction) => {
            const idx = parseInt(buttonInteraction.customId);
            if (board[idx]) return;

            if (!players[currentPlayer]) {
                console.error(`[ERROR] Người chơi ${currentPlayer} chưa được xác định.`);
                return buttonInteraction.reply({
                    content: "Lỗi: Người chơi chưa được xác định!",
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
            const winner = checkWinner(idx);

            if (winner) {
                embed.setDescription(`Người thắng: ${players[winner].tag} (${winner})`);
                collector.stop("winner");
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
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

        function checkWinner(index) {
            const directions = [
                [1, -1],   
                [size, -size],  
                [size + 1, -(size + 1)], 
                [size - 1, -(size - 1)]  
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
                count++;
                if (direction === 1 || direction === -1) {
                    if (Math.floor(i / size) !== Math.floor((i - direction) / size)) break;
                }
                i += direction;
            }
            return count;
        }
    }
};