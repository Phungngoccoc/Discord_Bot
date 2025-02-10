module.exports = {
    name: 'slot',
    description: '🎰 Chơi máy đánh bạc với hiệu ứng quay!',
    execute: async (message) => {
        const symbols = ['🍒', '🍋', '🍉', '⭐', '🍇'];

        // Tạo animation thay đổi biểu tượng
        const spinSlots = () => [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        // Gửi tin nhắn đầu tiên
        let msg = await message.reply(`🎰 | ⏳ | ⏳ | ⏳ |`);

        // Hiệu ứng quay: cập nhật tin nhắn nhiều lần trước khi dừng
        for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Chờ 500ms
            const [s1, s2, s3] = spinSlots();
            await msg.edit(`🎰 | ${s1} | ${s2} | ${s3} |`);
        }

        // Kết quả cuối cùng
        const [slot1, slot2, slot3] = spinSlots();
        const win = (slot1 === slot2 && slot2 === slot3) ? '🎉 Bạn thắng!' : '❌ Bạn thua!';

        await msg.edit(`🎰 | ${slot1} | ${slot2} | ${slot3} |\n${win}`);
    }
};