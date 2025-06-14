module.exports = async (client, interaction) => {
    // if (interaction.isChatInputCommand()) {
    //     console.log(`[DEBUG] Nhận lệnh: /${interaction.commandName} từ ${interaction.user.tag}`);

    //     const command = client.commands.get(interaction.commandName);
    //     if (!command) {
    //         console.error(`[ERROR] Không tìm thấy lệnh: /${interaction.commandName}`);
    //         return;
    //     }

    //     try {
    //         await command.execute(interaction);
    //         console.log(`[SUCCESS] Lệnh /${interaction.commandName} thực thi thành công!`);
    //     } catch (error) {
    //         console.error(`❌ Lỗi khi chạy lệnh /${interaction.commandName}:`, error);
    //         await interaction.reply({ content: "❌ Đã xảy ra lỗi!", flags: 64 });
    //     }
    // }

    // else if (interaction.isButton()) {
    //     console.log(`[DEBUG] Nhấn nút: ${interaction.customId} từ ${interaction.user.tag}`);

    //     const command = client.commands.get("chess"); // Lấy command xử lý button
    //     if (command && typeof command.handleButton === "function") {
    //         await command.handleButton(interaction);
    //     } else {
    //         console.error(`[ERROR] Không tìm thấy hoặc chưa định nghĩa handleButton.`);
    //         await interaction.reply({ content: "❌ Lỗi khi xử lý nút!", flags: 64 });
    //     }
    // }

    // else if (interaction.isModalSubmit()) {
    //     console.log(`[DEBUG] Submit modal: ${interaction.customId} từ ${interaction.user.tag}`);

    //     const command = client.commands.get("chess"); // Lấy command xử lý modal
    //     if (command && typeof command.handleModal === "function") {
    //         await command.handleModal(interaction);
    //     } else {
    //         console.error(`[ERROR] Không tìm thấy hoặc chưa định nghĩa handleModal.`);
    //         await interaction.reply({ content: "❌ Lỗi khi xử lý form nhập!", flags: 64 });
    //     }
    // }
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName); // ← dùng `slashCommands` thay vì `commands`
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ Lỗi khi thực hiện slash command ${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "⚠ Có lỗi xảy ra khi xử lý lệnh.", ephemeral: true });
        } else {
            await interaction.reply({ content: "⚠ Có lỗi xảy ra khi xử lý lệnh.", ephemeral: true });
        }
    }

};
