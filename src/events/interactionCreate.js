module.exports = async (client, interaction) => {
    // Slash command (Chat Input)
    if (interaction.isChatInputCommand()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) {
            console.warn(`⚠ Không tìm thấy slash command: ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`❌ Lỗi khi thực hiện slash command "${interaction.commandName}":`, error);
            const replyPayload = {
                content: "⚠ Có lỗi xảy ra khi xử lý lệnh.",
                ephemeral: true,
            };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(replyPayload).catch(console.error);
            } else {
                await interaction.reply(replyPayload).catch(console.error);
            }
        }
    }

    // Select Menu cho reaction role
    else if (interaction.isStringSelectMenu() && interaction.customId === 'reaction_roles_select') {
        const member = interaction.member;
        const selectedRoleIds = interaction.values;
        const allRoleIds = interaction.component.options.map(option => option.value);

        const addedRoles = selectedRoleIds.filter(id => !member.roles.cache.has(id));
        const removedRoles = allRoleIds.filter(id => !selectedRoleIds.includes(id) && member.roles.cache.has(id));

        try {
            if (addedRoles.length > 0) await member.roles.add(addedRoles);
            if (removedRoles.length > 0) await member.roles.remove(removedRoles);

            await interaction.reply({
                content: `✅ Đã cập nhật role của bạn.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error("❌ Lỗi khi xử lý reaction role:", error);
            await interaction.reply({
                content: "⚠ Có lỗi khi cập nhật role.",
                ephemeral: true,
            });
        }
    }
};
