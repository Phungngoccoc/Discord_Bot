const QuestionService = require("../../../service/questionService");

module.exports = {
    name: "addq",
    description: "Thêm câu hỏi trắc nghiệm",
    execute: async (message, args) => {
        if (!args.length) {
            return message.reply("Định dạng không đúng! Sử dụng: `addq Câu hỏi | Đáp án 1 | Đáp án 2 | Đáp án 3 | Đáp án 4 | Vị trí đáp án đúng (0-3)`");
        }

        try {
            const argsText = args.join(" ");
            const parts = argsText.split(" | ");

            if (parts.length !== 6) {
                return message.reply("Câu hỏi phải có đúng 4 đáp án và 1 vị trí đáp án đúng!");
            }

            const [question, option1, option2, option3, option4, correctIndex] = parts;
            const correctIndexNum = parseInt(correctIndex);

            if (isNaN(correctIndexNum) || correctIndexNum < 0 || correctIndexNum > 3) {
                return message.reply("⚠ Vị trí đáp án đúng phải là số từ 0 đến 3!");
            }

            await QuestionService.addQuestion(question, [option1, option2, option3, option4], correctIndexNum);

            message.reply("Câu hỏi đã được thêm thành công!");
        } catch (error) {
            console.error("Lỗi khi thêm câu hỏi:", error);
            message.reply("Đã xảy ra lỗi khi thêm câu hỏi.");
        }
    }
};
