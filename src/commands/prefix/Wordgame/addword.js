const fs = require('fs');
const path = require('path');
const { loadWords } = require('../../../utils/loadVietnameseWords');

module.exports = {
    name: 'addword',
    description: 'Thêm từ mới vào từ điển nối từ',

    execute: async (message, args) => {
        if (message.author.id !== '1075679018277404702') {
            return message.reply('Bạn không có quyền sử dụng lệnh này.');
        }
        if (!args || args.length < 1) {
            return message.reply('Vui lòng nhập từ bạn muốn thêm. Ví dụ: `addword khăng khít`');
        }

        const newWord = args.join(' ').trim().toLowerCase();
        const parts = newWord.split(/\s+/);

        // Kiểm tra số lượng âm tiết
        if (parts.length !== 2) {
            return message.reply('Chỉ chấp nhận từ ghép có đúng 2 âm tiết.');
        }

        // Kiểm tra ký tự hợp lệ (chữ cái tiếng Việt + dấu cách)
        const isValidVietnameseWord = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểẾỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸỳỵỷỹ\s]+$/.test(newWord);
        if (!isValidVietnameseWord) {
            return message.reply('Từ chỉ được chứa chữ cái và không có ký tự đặc biệt.');
        }

        const filePath = path.join(__dirname, '../../../data/dataWordGame.txt');

        try {
            const existingWords = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).map(w => w.trim().toLowerCase());

            if (existingWords.includes(newWord)) {
                return message.reply('⚠️ Từ này đã tồn tại trong từ điển.');
            }

            fs.appendFileSync(filePath, `\n${newWord}`);
            loadWords(); // Tải lại từ điển sau khi thêm
            return message.reply(`Đã thêm từ "${newWord}" vào từ điển.`);
        } catch (err) {
            console.error('[AddWord] Lỗi khi ghi file:', err);
            return message.reply('Đã xảy ra lỗi khi thêm từ.');
        }
    }
};
