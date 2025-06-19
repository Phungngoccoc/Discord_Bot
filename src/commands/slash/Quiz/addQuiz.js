const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, Events } = require('discord.js');
const QuestionService = require('../../../service/questionService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addq')
        .setDescription('📝 Thêm một câu hỏi trắc nghiệm mới'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_addq')
            .setTitle('Thêm câu hỏi trắc nghiệm')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('question')
                        .setLabel('Câu hỏi')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('option1')
                        .setLabel('Đáp án 1')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('option2')
                        .setLabel('Đáp án 2')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('option3')
                        .setLabel('Đáp án 3')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('option4_index')
                        .setLabel('Đáp án 4 và số thứ tự đúng (VD: Đáp án 4 | 2)')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                )
            );

        await interaction.showModal(modal);

        const filter = (i) => i.customId === 'modal_addq' && i.user.id === interaction.user.id;

        interaction.client.once(Events.InteractionCreate, async (modalInteraction) => {
            if (!modalInteraction.isModalSubmit()) return;

            try {
                const question = modalInteraction.fields.getTextInputValue('question');
                const option1 = modalInteraction.fields.getTextInputValue('option1');
                const option2 = modalInteraction.fields.getTextInputValue('option2');
                const option3 = modalInteraction.fields.getTextInputValue('option3');
                const option4Raw = modalInteraction.fields.getTextInputValue('option4_index');

                const parts = option4Raw.split('|').map(p => p.trim());
                if (parts.length !== 2) {
                    return modalInteraction.reply({
                        content: '❌ Vui lòng nhập đúng định dạng: Đáp án 4 | vị trí đúng (0-3)',
                        ephemeral: true,
                    });
                }

                const option4 = parts[0];
                const correctIndex = parseInt(parts[1]);

                if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
                    return modalInteraction.reply({
                        content: '⚠ Vị trí đáp án đúng phải là số từ 0 đến 3!',
                        ephemeral: true,
                    });
                }

                await QuestionService.addQuestion(
                    question,
                    [option1, option2, option3, option4],
                    correctIndex
                );

                await modalInteraction.reply({
                    content: '✅ Đã thêm câu hỏi thành công!',
                    ephemeral: true,
                });
            } catch (err) {
                console.error('❌ Lỗi khi thêm câu hỏi:', err);
                await interaction.reply({
                    content: '❌ Đã xảy ra lỗi khi thêm câu hỏi.',
                    ephemeral: true,
                });
            }
        });
    }
};
