const mongoose = require('mongoose');

// Tạo schema cho người dùng
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    money: { type: Number, default: 1000 },
    gameInProgress: { type: Boolean, default: false } // Trường mới để theo dõi trạng thái trò chơi
});

// Tạo model từ schema
const User = mongoose.model('User', userSchema);

module.exports = User;
