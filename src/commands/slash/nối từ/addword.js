const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { loadWords } = require('../../../utils/loadVietnameseWords');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addword')
        .setDescription('Thêm từ ghép vào từ điển nối từ')
        .addStringOption(option =>
            option.setName('word')
                .setDescription('Từ ghép 2 âm tiết bạn muốn thêm')
                .setRequired(true)
        ),

    async execute(interaction) {
        const allowedUserId = '1075679018277404702';
        if (interaction.user.id !== allowedUserId) {
            return interaction.reply({ content: 'Bạn không có quyền sử dụng lệnh này.', flags: 64 });
        }

        const newWord = interaction.options.getString('word').trim().toLowerCase();
        const parts = newWord.split(/\s+/);

        if (parts.length !== 2) {
            return interaction.reply({ content: 'Chỉ chấp nhận từ ghép có đúng **2 âm tiết**.', flags: 64 });
        }

        const isValidVietnameseWord = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểẾỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸỳỵỷỹ\s]+$/.test(newWord);
        if (!isValidVietnameseWord) {
            return interaction.reply({ content: 'Từ chỉ được chứa **chữ cái tiếng Việt** và không có ký tự đặc biệt.', flags: 64 });
        }

        const filePath = path.join(__dirname, '../../../data/dataWordGame.txt');

        try {
            const existingWords = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).map(w => w.trim().toLowerCase());

            if (existingWords.includes(newWord)) {
                return interaction.reply({ content: 'Từ này đã tồn tại trong từ điển.', flags: 64 });
            }

            fs.appendFileSync(filePath, `\n${newWord}`);
            loadWords(); // Reload từ điển
            return interaction.reply(`Đã thêm từ "**${newWord}**" vào từ điển thành công.`);
        } catch (err) {
            console.error('[AddWord] Lỗi khi ghi file:', err);
            return interaction.reply({ content: 'Đã xảy ra lỗi khi thêm từ.', flags: 64 });
        }
    }
};