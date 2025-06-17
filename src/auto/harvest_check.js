const Farm = require("../model/farmModel");
const { EmbedBuilder } = require('discord.js');
const { crops } = require("../utils/constants");

module.exports = {
    name: "readyCheck",
    description: "Kiểm tra và thông báo cây trồng đã sẵn sàng thu hoạch.",
    execute: async (client) => {
        setInterval(async () => {
            const farms = await Farm.find(); 
            const currentTime = Date.now();

            farms.forEach(async (farm) => {
                let harvestAlert = {};
                let notifiedCrops = new Set(); 

                farm.crops.forEach((crop, index) => {
                    if (!crop) return;

                    const elapsedTime = currentTime - new Date(crop.plantedAt).getTime();
                    const fullGrowthTime = crops[crop.name].harvestTime;

                    if (elapsedTime >= fullGrowthTime && !crop.isAlert) {
                        if (harvestAlert[crop.name]) {
                            harvestAlert[crop.name] += 1; 
                        } else {
                            harvestAlert[crop.name] = 1; 
                        }
                        farm.crops[index].isAlert = true;
                    }
                });

                if (Object.keys(harvestAlert).length > 0) {
                    const user = await client.users.fetch(farm.userId); 
                    if (user) {
                        let harvestMessage = [];
                        for (let cropName in harvestAlert) {
                            if (!notifiedCrops.has(cropName)) {
                                harvestMessage.push(`${crops[cropName].emoji} **${cropName}** x${harvestAlert[cropName]} đã sẵn sàng thu hoạch!`);
                                notifiedCrops.add(cropName); 
                            }
                        }

                        const messageChunks = chunkMessage(harvestMessage.join("\n")); 

                        for (const chunk of messageChunks) {
                            await user.send(chunk);
                        }

                        await farm.save();
                    }
                }
            });
        }, 10000); 
    },
};

function chunkMessage(message) {
    const maxLength = 2000;
    const chunks = [];

    for (let i = 0; i < message.length; i += maxLength) {
        chunks.push(message.slice(i, i + maxLength));
    }

    return chunks;
}
