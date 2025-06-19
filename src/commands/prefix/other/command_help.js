const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Hiển thị danh sách lệnh prefix của bot',

    execute: async (message) => {
        const prefix = process.env.PREFIX || '!';
        const basePath = path.join(__dirname, '..'); 

        const categories = {};

        const categoryDirs = fs.readdirSync(basePath).filter(dir =>
            fs.statSync(path.join(basePath, dir)).isDirectory()
        );

        for (const category of categoryDirs) {
            const categoryPath = path.join(basePath, category);
            const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(categoryPath, file);
                const command = require(filePath);

                if (!command.name) continue;

                if (!categories[category]) categories[category] = [];
                categories[category].push(`\`${command.name}\``);
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({ name: 'Danh sách lệnh', iconURL: message.author.displayAvatarURL() })
            .setDescription(`📌 Prefix của bot là \`${prefix}\``);

        for (const [category, commands] of Object.entries(categories)) {
            embed.addFields({
                name: `${category}`,
                value: commands.join(' '),
                inline: false
            });
        }

        await message.channel.send({ embeds: [embed] });
    }
};
