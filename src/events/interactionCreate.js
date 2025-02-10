module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    console.log(`[DEBUG] Nhận lệnh: /${interaction.commandName} từ ${interaction.user.tag}`);

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`[ERROR] Không tìm thấy lệnh: /${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
        console.log(`[SUCCESS] Lệnh /${interaction.commandName} thực thi thành công!`);
    } catch (error) {
        console.error(`❌ Lỗi khi chạy lệnh /${interaction.commandName}:`, error);
        await interaction.reply({ content: "❌ Đã xảy ra lỗi!", flags: 64 });
    }
};
