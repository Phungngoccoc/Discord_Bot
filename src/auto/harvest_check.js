const Farm = require("../model/farmModel");
const { EmbedBuilder } = require('discord.js');
const { crops } = require("../utils/constants");

module.exports = {
    name: "readyCheck",
    description: "Kiểm tra và thông báo cây trồng đã sẵn sàng thu hoạch.",
    execute: async (client) => {
        // Lên lịch kiểm tra mỗi 5 phút (300000ms)
        setInterval(async () => {
            const farms = await Farm.find(); // Lấy tất cả trang trại người dùng
            const currentTime = Date.now();

            farms.forEach(async (farm) => {
                let harvestAlert = {};
                let notifiedCrops = new Set(); // Để lưu các loại cây đã được thông báo

                farm.crops.forEach((crop, index) => {
                    if (!crop) return;

                    const elapsedTime = currentTime - new Date(crop.plantedAt).getTime();
                    const fullGrowthTime = crops[crop.name].harvestTime;

                    // Nếu cây đã hoàn thành việc phát triển và có thể thu hoạch
                    if (elapsedTime >= fullGrowthTime && !crop.isAlert) {
                        if (harvestAlert[crop.name]) {
                            harvestAlert[crop.name] += 1; // Tăng số lượng cây trồng cùng loại
                        } else {
                            harvestAlert[crop.name] = 1; // Khởi tạo số lượng cây trồng
                        }

                        // Cập nhật trường isAlert để đánh dấu cây này đã thông báo
                        farm.crops[index].isAlert = true;
                    }
                });

                // Nếu có cây trồng sẵn sàng thu hoạch, gửi thông báo qua DM
                if (Object.keys(harvestAlert).length > 0) {
                    const user = await client.users.fetch(farm.userId); // Lấy người dùng bằng ID
                    if (user) {
                        // Tạo thông báo, mỗi loại cây trồng sẽ có số lượng
                        let harvestMessage = [];
                        for (let cropName in harvestAlert) {
                            // Kiểm tra xem đã thông báo cho loại cây này chưa
                            if (!notifiedCrops.has(cropName)) {
                                harvestMessage.push(`${crops[cropName].emoji} **${cropName}** x${harvestAlert[cropName]} đã sẵn sàng thu hoạch!`);
                                notifiedCrops.add(cropName); // Đánh dấu đã thông báo cho cây này
                            }
                        }

                        const messageChunks = chunkMessage(harvestMessage.join("\n")); // Chia tin nhắn thành các phần nhỏ

                        // Gửi từng phần tin nhắn
                        for (const chunk of messageChunks) {
                            await user.send(chunk);
                        }

                        // Lưu lại sự thay đổi trong cơ sở dữ liệu (đánh dấu cây đã thông báo)
                        await farm.save();
                    }
                }
            });
        }, 10000); // Mỗi 5 phút
    },
};

// Hàm chia tin nhắn thành các phần nhỏ không vượt quá 2000 ký tự
function chunkMessage(message) {
    const maxLength = 2000;
    const chunks = [];

    for (let i = 0; i < message.length; i += maxLength) {
        chunks.push(message.slice(i, i + maxLength));
    }

    return chunks;
}
