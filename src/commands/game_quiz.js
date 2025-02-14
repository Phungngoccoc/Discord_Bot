const { EmbedBuilder } = require("discord.js");
const Question = require("../model/questionModel"); // Model câu hỏi
const User = require("../model/userModel"); // Model người dùng

module.exports = {
    name: "quiz",
    execute: async (message, args) => {
        try {
            // Lấy ngẫu nhiên 1 câu hỏi từ MongoDB
            const questionCount = await Question.countDocuments();
            if (questionCount === 0) {
                return message.channel.send("❌ Không có câu hỏi nào trong cơ sở dữ liệu!");
            }

            const randomIndex = Math.floor(Math.random() * questionCount);
            const randomQuestion = await Question.findOne().skip(randomIndex);

            if (!randomQuestion) {
                return message.channel.send("❌ Lỗi khi lấy câu hỏi!");
            }

            const { question, options, correctIndex } = randomQuestion;
            let answered = false; // ✅ Theo dõi trạng thái trả lời

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle("🎓 Câu hỏi trắc nghiệm!")
                .setDescription(`${question}\n${options.map((opt, i) => `${i + 1}. ${opt}`).join("\n")}`)
                .setFooter({ text: "Trả lời bằng cách nhập số (1-4)" });

            message.channel.send({ embeds: [embed] });

            // Tạo bộ lọc để kiểm tra câu trả lời
            const filter = (response) => {
                return (
                    response.author.id === message.author.id &&
                    ["1", "2", "3", "4"].includes(response.content)
                );
            };

            // Chờ người dùng trả lời trong 10 giây
            const collector = message.channel.createMessageCollector({ filter, time: 10000 });

            collector.on("collect", async (response) => {
                if (answered) return; // Nếu đã trả lời trước đó, không làm gì cả
                answered = true; // Đánh dấu đã trả lời

                const userAnswer = parseInt(response.content, 10) - 1; // Chuyển đổi về index (0-3)

                if (userAnswer === correctIndex) {
                    // ✅ Trả lời đúng -> Cộng 100 xu
                    const userId = response.author.id;
                    let user = await User.findOne({ userId });

                    if (!user) {
                        // Nếu người chơi chưa có trong database, tạo mới
                        user = new User(userId, { money: 100 });
                    } else {
                        // Nếu đã có, cập nhật số xu
                        user.money += 100;
                    }

                    await user.save(); // Lưu vào database
                    message.channel.send(`✅ Đúng rồi! Bạn nhận được **100 xu**. Tổng xu hiện tại: **${user.money} xu**`);
                } else {
                    message.channel.send(`❌ Sai rồi! Đáp án đúng là: **${options[correctIndex]}**`);
                }

                collector.stop(); // Dừng collector
            });

            collector.on("end", (collected) => {
                if (!answered) {
                    message.channel.send("🕒 Hết thời gian trả lời!");
                }
            });
        } catch (error) {
            console.error("❌ Lỗi khi lấy câu hỏi từ MongoDB:", error);
            message.channel.send("⚠️ Đã xảy ra lỗi! Vui lòng thử lại sau.");
        }
    },
};
