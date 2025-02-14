const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true }  // 🔄 Đổi từ `answer` sang `correctIndex`
});

module.exports = mongoose.model("Question", questionSchema);
