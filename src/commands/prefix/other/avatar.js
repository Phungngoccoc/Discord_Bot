module.exports = {
    name: 'avatar',
    description: '📸 Xem avatar của người dùng',

    execute: async (message, args) => {
        let targetUser;

        // Nếu có tag (mention)
        if (message.mentions.users.size > 0) {
            targetUser = message.mentions.users.first();
        }
        // Nếu có truyền ID
        else if (args[0]) {
            try {
                targetUser = await message.client.users.fetch(args[0]);
            } catch (err) {
                return message.channel.send('Không tìm thấy người dùng.');
            }
        }
        // Nếu không truyền gì, lấy chính người gửi
        else {
            targetUser = message.author;
        }

        const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = {
            color: 0x00bfff,
            title: `Avatar của ${targetUser.tag}`,
            image: { url: avatarURL },
        };

        message.channel.send({ embeds: [embed] });
    },
};
