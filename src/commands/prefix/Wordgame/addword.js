const fs = require('fs');
const path = require('path');
const { loadWords } = require('../../../utils/loadVietnameseWords');
module.exports = {
    name: 'addword',
    description: 'Thêm từ mới vào từ điển nối từ',

    execute: async (message, args) => {
        if (!args || args.length < 1) {
            return message.reply('❗ Vui lòng nhập từ bạn muốn thêm. Ví dụ: `addword khăng khít`');
        }

        const newWord = args.join(' ').trim().toLowerCase();
        const parts = newWord.split(/\s+/);

        if (parts.length !== 2) {
            return message.reply('❗ Chỉ chấp nhận từ ghép có đúng 2 âm tiết.');
        }

        const filePath = path.join(__dirname, '../../../data/dataWordGame.txt');

        try {
            const existingWords = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).map(w => w.trim().toLowerCase());

            if (existingWords.includes(newWord)) {
                return message.reply('⚠️ Từ này đã tồn tại trong từ điển.');
            }

            fs.appendFileSync(filePath, `\n${newWord}`);
            loadWords();
            return message.reply(`✅ Đã thêm từ "${newWord}" vào từ điển.`);
        } catch (err) {
            console.error('[AddWord] Lỗi khi ghi file:', err);
            return message.reply('❌ Đã xảy ra lỗi khi thêm từ.');
        }
    }
};
