const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { getUserData, updateUserData } = require("../../../service/userService");

let gameRunning = false;

module.exports = {
    name: "tx",
    description: "Chơi Tài Xỉu bằng cách đặt cược!",
    execute: async (message) => {
        try {
            if (gameRunning) {
                return message.reply("⚠️ Hiện tại đang có một ván Tài Xỉu diễn ra. Vui lòng chờ kết thúc trước khi bắt đầu ván mới!");
            }

            gameRunning = true;

            const embed = new Discord.EmbedBuilder()
                .setColor("#ffcc00")
                .setTitle("🎲 Chơi Tài Xỉu 🎲")
                .setDescription("Nhấn vào một trong hai nút dưới đây để đặt cược! Bạn có 15 giây để đặt cược.")
                .setFooter({ text: "Dưới 10 điểm là Xỉu, từ 10 điểm trở lên là Tài." });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("bet_tai").setLabel("Tài").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("bet_xiu").setLabel("Xỉu").setStyle(ButtonStyle.Danger)
            );

            const msg = await message.channel.send({ embeds: [embed], components: [row] });

            const bets = new Map();
            const userChoices = new Map();
            const filter = (interaction) => interaction.isButton() && interaction.message.id === msg.id;
            const collector = message.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on("collect", async (interaction) => {
                try {
                    const userId = interaction.user.id;

                    if (userChoices.has(userId)) {
                        return interaction.reply({ content: "⚠️ Bạn đã đặt cược rồi, không thể đặt tiếp!", flags: 64 });
                    }

                    const betChoice = interaction.customId === "bet_tai" ? "Tài" : "Xỉu";
                    userChoices.set(userId, betChoice);

                    const modal = new ModalBuilder()
                        .setCustomId(`bet_modal_${userId}`)
                        .setTitle(`Đặt cược vào ${betChoice}`);

                    const input = new TextInputBuilder()
                        .setCustomId("bet_amount")
                        .setLabel("Nhập số tiền cược:")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const modalRow = new ActionRowBuilder().addComponents(input);
                    modal.addComponents(modalRow);

                    await interaction.showModal(modal);
                } catch (error) {
                    console.error("Lỗi khi mở modal:", error);
                }
            });

            message.client.on("interactionCreate", async (interaction) => {
                if (!interaction.isModalSubmit()) return;

                try {
                    const userId = interaction.user.id;
                    const betAmount = parseInt(interaction.fields.getTextInputValue("bet_amount"));

                    if (isNaN(betAmount) || betAmount <= 0) {
                        return interaction.reply({ content: "Số tiền cược không hợp lệ!", flags: 64 });
                    }

                    const userData = await getUserData(userId);
                    if (!userData || isNaN(userData.money) || userData.money < betAmount) {
                        return interaction.reply({ content: "Bạn không có đủ tiền để đặt cược!", flags: 64 });
                    }

                    const choice = userChoices.get(userId);
                    bets.set(userId, { choice, amount: betAmount });
                    await interaction.reply({ content: `Bạn đã đặt cược **${betAmount}** xu vào **${choice}**!`, flags: 64 });
                } catch (error) {
                    console.error("Lỗi khi xử lý đặt cược:", error);
                }
            });

            collector.on("end", async () => {
                try {
                    const rollingEmbed = new Discord.EmbedBuilder()
                        .setColor("#ffcc00")
                        .setTitle("🎲 Tung xúc xắc... 🎲")
                        .setDescription("<a:noooooo:1228414116725653634>  <a:noooooo:1228414116725653634>  <a:noooooo:1228414116725653634>")
                        .setFooter({ text: "Chờ kết quả trong giây lát..." });

                    const rollingMessage = await message.channel.send({ embeds: [rollingEmbed] });
                    await new Promise((resolve) => setTimeout(resolve, 3000));

                    const diceEmojis = ["<:tx1:1339511294453354530> ", "<:tx2:1339511297338769448>", "<:tx3:1339511299368816640>", "<:tx4:1339511301617094657>", "<:tx5:1339511305723318313>", "<:tx6:1339511308554600508>"];
                    const dice = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);
                    const total = dice.reduce((a, b) => a + b, 0);
                    const result = total >= 10 ? "Tài" : "Xỉu";

                    const diceDisplay = dice.map(num => diceEmojis[num - 1]).join(" ");

                    const resultEmbed = new Discord.EmbedBuilder()
                        .setColor("#ffcc00")
                        .setTitle("🎲 Kết quả tung xúc xắc 🎲")
                        .setDescription(`${diceDisplay}\n\nTổng điểm: **${total}**\n➡️ Kết quả: **${result}**`)
                        .setFooter({ text: "Cảm ơn đã tham gia!" });

                    await rollingMessage.edit({ embeds: [resultEmbed] });

                    let outcomeMessage = "";
                    for (const [userId, bet] of bets) {
                        const userData = await getUserData(userId);
                        if (!userData || isNaN(userData.money)) continue;

                        if (bet.choice === result) {
                            await updateUserData(userId, { money: userData.money + bet.amount });
                            outcomeMessage += `<@${userId}> 🎉 thắng **${bet.amount}** xu!\n`;
                        } else {
                            await updateUserData(userId, { money: userData.money - bet.amount });
                            outcomeMessage += `<@${userId}> 😢 thua **${bet.amount}** xu!\n`;
                        }
                    }

                    if (outcomeMessage) {
                        await message.channel.send({ content: outcomeMessage });
                    }
                } catch (error) {
                    console.error("Lỗi khi xử lý kết quả trò chơi:", error);
                } finally {
                    gameRunning = false;
                }
            });
        } catch (error) {
            console.error("Lỗi khi chạy lệnh tài xỉu:", error);
            gameRunning = false;
        }
    }
};
