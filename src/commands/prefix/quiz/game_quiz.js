const { EmbedBuilder } = require("discord.js");
const Question = require("../../../model/questionModel"); 
const User = require("../../../model/userModel"); 

module.exports = {
    name: "quiz",
    execute: async (message, args) => {
        try {
            const questionCount = await Question.countDocuments();
            if (questionCount === 0) {
                return message.channel.send("Không có câu hỏi nào trong cơ sở dữ liệu!");
            }

            const randomIndex = Math.floor(Math.random() * questionCount);
            const randomQuestion = await Question.findOne().skip(randomIndex);

            if (!randomQuestion) {
                return message.channel.send("Lỗi khi lấy câu hỏi!");
            }

            const { question, options, correctIndex } = randomQuestion;
            let answered = false; 
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle("🎓 Câu hỏi trắc nghiệm!")
                .setDescription(`${question}\n${options.map((opt, i) => `${i + 1}. ${opt}`).join("\n")}`)
                .setFooter({ text: "Trả lời bằng cách nhập số (1-4)" });

            message.channel.send({ embeds: [embed] });

            const filter = (response) => {
                return (
                    response.author.id === message.author.id &&
                    ["1", "2", "3", "4"].includes(response.content)
                );
            };

            const collector = message.channel.createMessageCollector({ filter, time: 10000 });

            collector.on("collect", async (response) => {
                if (answered) return;
                answered = true; 

                const userAnswer = parseInt(response.content, 10) - 1; 

                if (userAnswer === correctIndex) {
                    const userId = response.author.id;
                    let user = await User.findOne({ userId });

                    if (!user) {
                        user = new User(userId, { money: 100 });
                    } else {
                        user.money += 100;
                    }

                    await user.save(); 
                    message.channel.send(`✅ Đúng rồi! Bạn nhận được **100 xu**. Tổng xu hiện tại: **${user.money} xu**`);
                } else {
                    message.channel.send(`❌ Sai rồi! Đáp án đúng là: **${options[correctIndex]}**`);
                }

                collector.stop(); 
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
