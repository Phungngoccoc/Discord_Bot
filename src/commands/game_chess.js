const { Chess } = require("chess.js");

const games = new Map(); // Lưu trữ ván cờ theo userId

module.exports = {
    name: "chess",
    description: "Chơi cờ vua với bot",

    async execute(message) {
        const userId = message.author.id;
        let game = games.get(userId);

        const content = message.content.trim(); // Lấy nội dung tin nhắn
        const args = content.split(/\s+/); // Tách chuỗi theo dấu cách
        const move = args[1] || ""; // Lấy nước đi từ tham số thứ hai

        // Nếu người chơi chỉ nhập "!chess" -> bắt đầu ván cờ mới
        if (!game) {
            game = new Chess();
            games.set(userId, game);
            return message.reply(`♟️ **Ván cờ mới đã bắt đầu!** Hãy nhập nước đi (VD: \`kchess e2e4\`)\n${renderBoard(game)}`);
        }

        // Nếu người chơi chỉ nhập "!chess", hiển thị bàn cờ
        if (!move) {
            return message.reply(`♟️ **Bàn cờ hiện tại:**\n${renderBoard(game)}`);
        }

        // Xử lý di chuyển quân cờ
        try {
            const result = game.move(move, { sloppy: true });

            if (!result) {
                return message.reply("⚠️ Nước đi không hợp lệ! Hãy thử lại.");
            }

            let response = `✅ Bạn đã đi: **${move}**`;
            let endMessage = "";

            if (game.isCheckmate()) {
                endMessage = "\n🚨 Chiếu hết! Bạn thắng!";
                games.delete(userId);
            } else if (game.isDraw()) {
                endMessage = "\n⚖️ Ván cờ hòa!";
                games.delete(userId);
            }

            return message.reply(`${response}${endMessage}\n${renderBoard(game)}`);

        } catch (error) {
            return message.reply("⚠️ Lỗi: Nước đi không hợp lệ. Hãy kiểm tra lại!");
        }
    }
};

function renderBoard(game) {
    const board = game.board();
    let display = "";
    display += "       a      b    c     d     e     f      g     h\n\n";

    const emojiMap = {
        P: "<:wp:1339260409915510916>", N: "<:wk:1339260415519096853>", B: "<:wb:1339260418006454374>", R: "<:wr:1339260404995723315>", Q: "<:wq:1339260407289872485>", K: "<:wki:1339260412293677147>",
        p: "<:bp:1339260425732362321>", n: "<:bk:1339260430362873876>", b: "<:bb:1339260433239904307>", r: "<:br:1339260420568911944>", q: "<:bq:1339260423546867824>", k: "<:bki:1339260428395479050>"
    };

    for (let i = 0; i < board.length; i++) {
        display += `${8 - i}    `;
        display += board[i].map(cell => cell ? emojiMap[cell.color === "w" ? cell.type.toUpperCase() : cell.type] : "⬜").join(" ");
        display += `    ${8 - i}\n\n`;
    }

    display += "       a      b    c     d     e     f      g     h";

    return display;
}
