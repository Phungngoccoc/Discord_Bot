const { SlashCommandBuilder, EmbedBuilder, ComponentType } = require("discord.js");
const Question = require("../../../model/questionModel");
const User = require("../../../model/userModel");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("quiz")
        .setDescription("Trả lời một câu hỏi trắc nghiệm để nhận xu"),

    async execute(interaction) {
        try {
            const questionCount = await Question.countDocuments();
            if (questionCount === 0) {
                return interaction.reply("❌ Không có câu hỏi nào trong cơ sở dữ liệu!");
            }

            const randomIndex = Math.floor(Math.random() * questionCount);
            const randomQuestion = await Question.findOne().skip(randomIndex);

            if (!randomQuestion) {
                return interaction.reply("⚠️ Lỗi khi lấy câu hỏi!");
            }

            const { question, options, correctIndex } = randomQuestion;
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle("🎓 Câu hỏi trắc nghiệm!")
                .setDescription(`${question}\n\n${options.map((opt, i) => `**${i + 1}.** ${opt}`).join("\n")}`)
                .setFooter({ text: "Hãy trả lời bằng cách nhập số (1 - 4) trong vòng 15 giây!" });

            await interaction.reply({ embeds: [embed] });

            const filter = (m) => {
                return m.author.id === interaction.user.id && ["1", "2", "3", "4"].includes(m.content.trim());
            };

            const collector = interaction.channel.createMessageCollector({ filter, time: 15000, max: 1 });

            collector.on("collect", async (msg) => {
                const answer = parseInt(msg.content.trim()) - 1;
                const userId = msg.author.id;

                if (answer === correctIndex) {
                    let user = await User.findOne({ userId });
                    if (!user) {
                        user = new User({ userId, money: 100 });
                    } else {
                        user.money += 100;
                    }

                    await user.save();
                    msg.reply(`Đúng rồi! Bạn nhận được **100 xu**. Tổng xu hiện tại: **${user.money} xu**`);
                } else {
                    msg.reply(`Sai rồi! Đáp án đúng là: **${options[correctIndex]}**`);
                }
            });

            collector.on("end", (collected) => {
                if (collected.size === 0) {
                    interaction.channel.send("⌛ Hết thời gian trả lời!");
                }
            });
        } catch (error) {
            console.error("Lỗi khi xử lý /quiz:", error);
            interaction.reply({ content: "⚠️ Có lỗi xảy ra khi xử lý câu hỏi.", flags: 64 });
        }
    },
};
