const { SlashCommandBuilder } = require('discord.js');
const Farm = require('../../../model/farmModel');
const User = require('../../../model/userModel');
const { crops } = require('../../../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('harvest')
        .setDescription('Thu hoạch cây trồng đã chín và loại bỏ cây bị sâu'),
    category: 'farm',

    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findOne({ userId });
        const farm = await Farm.findOne({ userId });

        if (!user || !farm) {
            return interaction.reply({
                content: 'Bạn chưa có trang trại! Dùng lệnh `/farm` để tạo nông trại mới.',
                flags: 64
            });
        }

        const now = Date.now();
        const harvestedCrops = [];
        const removedCrops = [];
        const newCrops = [];

        for (const crop of farm.crops) {
            const plantedAt = new Date(crop.plantedAt).getTime();
            const elapsedTime = now - plantedAt;
            const growTime = crop.harvestTime;
            const damageTime = growTime + 60 * 60 * 1000;

            if (elapsedTime >= damageTime) {
                removedCrops.push(crop.name);
                continue;
            }

            if (elapsedTime >= growTime) {
                harvestedCrops.push(crop.name);
                if (!user.storage) user.storage = new Map();
                if (!user.storage.get) {
                    // convert object to Map (if from Mongo)
                    user.storage = new Map(Object.entries(user.storage));
                }
                user.storage.set(crop.name, (user.storage.get(crop.name) || 0) + 1);
            } else {
                newCrops.push(crop);
            }
        }

        farm.crops = newCrops;

        // Convert Map to plain object for MongoDB
        if (user.storage instanceof Map) {
            user.storage = Object.fromEntries(user.storage);
        }

        await user.save();
        await farm.save();

        const messages = [];

        if (harvestedCrops.length > 0) {
            const summary = {};
            harvestedCrops.forEach(name => {
                summary[name] = (summary[name] || 0) + 1;
            });

            const message = Object.entries(summary)
                .map(([name, count]) => `${crops[name]?.emoji || '🌱'} ${name}: ${count}`)
                .join('\n');
            messages.push(`Bạn đã thu hoạch thành công:\n${message}\nĐã được lưu vào kho.`);
        }

        if (removedCrops.length > 0) {
            const summary = {};
            removedCrops.forEach(name => {
                summary[name] = (summary[name] || 0) + 1;
            });

            const message = Object.entries(summary)
                .map(([name, count]) => `🪳 ${name}: ${count} cây bị sâu và bị loại bỏ!`)
                .join('\n');
            messages.push(`Một số cây đã bị sâu:\n${message}`);
        }

        if (messages.length === 0) {
            return interaction.reply('Không có cây nào sẵn sàng để thu hoạch hoặc bị sâu!');
        }

        return interaction.reply(messages.join('\n\n'));
    }
};
