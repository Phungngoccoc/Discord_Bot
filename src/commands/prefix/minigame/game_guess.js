// module.exports = {
//     name: 'guess',
//     description: '🔢 Đoán số (1-10)',
//     execute: async (message, args) => {
//         const number = Math.floor(Math.random() * 10) + 1;
//         const guess = parseInt(args[0]);

//         if (isNaN(guess) || guess < 1 || guess > 10) {
//             return message.reply('⚠ Hãy nhập một số từ 1 đến 10!');
//         }

//         const result = guess === number ? '🎉 Bạn đoán đúng!' : `❌ Sai rồi! Số đúng là **${number}**.`;
//         message.reply(result);
//     }
// };
