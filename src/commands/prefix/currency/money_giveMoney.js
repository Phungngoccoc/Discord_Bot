const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getUserData, updateUserData } = require("../../../service/userService");

module.exports = {
    name: "give",
    description: "Chuyển tiền cho người khác",
    execute: async (message) => {
        const args = message.content.split(" ");
        if (args.length < 3) {
            return message.reply("Sai cú pháp! Dùng: `give @nguoichuyen 500`");
        }

        let receiver = message.mentions.users.first();
        let amount = parseInt(args[2]);

        if (!receiver || isNaN(amount) || amount <= 0) {
            return message.reply("Vui lòng nhập số tiền hợp lệ!");
        }

        let sender = message.author;
        if (receiver.bot) return message.reply("Bot không thể nhận tiền!");
        if (sender.id === receiver.id) return message.reply("Bạn không thể tự chuyển tiền cho mình!");

        let senderData = await getUserData(sender.id);
        if (!senderData || senderData.money < amount) {
            return message.reply("Bạn không có đủ tiền để chuyển!");
        }

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setTitle(`${sender.username}, bạn sắp chuyển tiền cho ${receiver.username}`)
            .setDescription(`Bạn sẽ chuyển **${amount} xu** cho <@${receiver.id}>.`)
            .addFields(
                { name: "🔹 Người gửi:", value: `<@${sender.id}>`, inline: true },
                { name: "🔹 Người nhận:", value: `<@${receiver.id}>`, inline: true },
                { name: "💰 Số tiền:", value: `**${amount} xu**`, inline: false }
            )
            .setFooter({ text: "Nhấn ✅ để xác nhận hoặc ❌ để hủy." });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("confirm").setLabel("✅ Confirm").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("cancel").setLabel("❌ Cancel").setStyle(ButtonStyle.Danger)
        );

        let confirmMsg = await message.channel.send({ embeds: [embed], components: [row] });

        const filter = (interaction) =>
            ["confirm", "cancel"].includes(interaction.customId) && interaction.user.id === sender.id;

        const collector = confirmMsg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on("collect", async (interaction) => {
            if (interaction.customId === "confirm") {
                await updateUserData(sender.id, { money: senderData.money - amount });
                await updateUserData(receiver.id, { money: (await getUserData(receiver.id)).money + amount });

                await interaction.update({
                    content: `**Giao dịch thành công!** <@${sender.id}> đã chuyển **${amount} xu** cho <@${receiver.id}>.`,
                    embeds: [],
                    components: []
                });
            } else {
                await interaction.update({
                    content: "**Giao dịch đã bị hủy!**",
                    embeds: [],
                    components: []
                });
            }
        });

        collector.on("end", async () => {
            confirmMsg.edit({ components: [] }).catch(() => { });
        });
    }
};
