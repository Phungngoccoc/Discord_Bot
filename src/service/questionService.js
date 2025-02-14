const Question = require("../model/questionModel");

const QuestionService = {
    /**
     * Lấy tất cả câu hỏi từ database
     */
    async getAllQuestions() {
        return await Question.find({});
    },

    /**
     * Lấy một câu hỏi ngẫu nhiên từ database
     */
    async getRandomQuestion() {
        const count = await Question.countDocuments();
        if (count === 0) return null;

        const randomIndex = Math.floor(Math.random() * count);
        return await Question.findOne().skip(randomIndex);
    },

    /**
     * Lấy câu hỏi theo ID
     * @param {String} id - ID của câu hỏi
     */
    async getQuestionById(id) {
        return await Question.findById(id);
    },

    /**
     * Thêm một câu hỏi mới vào database
     * @param {String} question - Nội dung câu hỏi
     * @param {Array} options - Danh sách đáp án
     * @param {Number} correctIndex - Vị trí đáp án đúng (0-3)
     */
    async addQuestion(question, options, correctIndex) {
        if (options.length !== 4 || correctIndex < 0 || correctIndex > 3) {
            throw new Error("Câu hỏi phải có 4 đáp án và vị trí đúng từ 0-3.");
        }

        const newQuestion = new Question({ question, options, correctIndex });
        return await newQuestion.save();
    },

    /**
     * Cập nhật một câu hỏi
     * @param {String} id - ID câu hỏi cần cập nhật
     * @param {Object} updatedData - Dữ liệu mới
     */
    async updateQuestion(id, updatedData) {
        return await Question.findByIdAndUpdate(id, updatedData, { new: true });
    },

    /**
     * Xóa một câu hỏi theo ID
     * @param {String} id - ID câu hỏi cần xóa
     */
    async deleteQuestion(id) {
        return await Question.findByIdAndDelete(id);
    }
};

module.exports = QuestionService;
