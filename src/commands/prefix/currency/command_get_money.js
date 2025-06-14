const { updateUserData } = require("../../../service/userService");
const User = require("../../../model/userModel");

module.exports = {
    name: "getmoney",
    description: "Lấy 10 triệu xu",
    execute: async (message) => {
        const userId = message.author.id;

        // Tìm người dùng trong DB
        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId, money: 0 });
        }

        // Cộng 100 triệu xu
        user.money += 100_000_000;
        await user.save();

        message.reply("💰 Bạn đã nhận được **100 triệu xu**!");
    },
};
