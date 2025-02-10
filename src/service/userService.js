const User = require('../model/userModel'); // Đảm bảo đường dẫn đúng

// Lấy dữ liệu người dùng từ MongoDB
const getUserData = async (userId) => {
    try {
        let user = await User.findOne({ userId });
        if (!user) {
            // Nếu người dùng chưa tồn tại, tạo mới và lưu vào database
            user = new User({ userId, money: 1000, gameInProgress: false });
            await user.save();
        }
        return user;  // Trả về dữ liệu người dùng
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
        throw new Error('Không thể lấy dữ liệu người dùng.');
    }
};


// Cập nhật dữ liệu người dùng
const updateUserData = async (userId, data) => {
    try {
        const result = await User.updateOne({ userId }, { $set: data });
        if (result.modifiedCount === 0) {
            console.log('Không có thay đổi nào được thực hiện.');
        }
        return result;
    } catch (error) {
        console.error('Lỗi khi cập nhật dữ liệu người dùng:', error);
        throw new Error('Không thể cập nhật dữ liệu người dùng.');
    }
};

module.exports = {
    getUserData,
    updateUserData
};
