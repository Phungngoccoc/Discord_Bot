const mongoose = require('mongoose');

// Tạo schema cho người dùng
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    money: { type: Number, default: 1000 },
    gameInProgress: { type: Boolean, default: false },
    lastWorked: { type: Number, default: 0 }, // Thời gian cuối cùng nhận tiền từ work
    lastRob: { type: Number, default: 0 }, // Thời gian cuối cùng nhận tiền từ rob
    lastCrime: { type: Number, default: 0 }, // Thời gian cuối cùng nhận tiền từ rob
    lastMine: { type: Number, default: 0 }
});

// Tạo model từ schema
const User = mongoose.model('User', userSchema);

module.exports = User;