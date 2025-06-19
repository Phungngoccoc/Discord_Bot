const { updateUserData } = require("../../../service/userService");
const User = require("../../../model/userModel");

module.exports = {
    name: "getmoney",
    description: "Lấy 10 triệu xu",
    category: "currency",
    execute: async (message) => {
        const userId = message.author.id;

        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId, money: 0 });
        }

        user.money += 100_000_000;
        await user.save();

        message.reply("Bạn đã nhận được **100 triệu xu**!");
    },
};
