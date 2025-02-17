const crops = {
    "rice": { emoji: "🌾", buyPrice: 20, sellPrice: 40, harvestTime: 30 * 60 * 1000 }, // 10 phút
    "carrot": { emoji: "🥕", buyPrice: 35, sellPrice: 70, harvestTime: 45 * 60 * 1000 }, // 12 phút
    "corn": { emoji: "🌽", buyPrice: 30, sellPrice: 60, harvestTime: 60 * 60 * 1000 }, // 20 phút
    "potato": { emoji: "🥔", buyPrice: 40, sellPrice: 80, harvestTime: 90 * 60 * 1000 }, // 25 phút
    "tomato": { emoji: "🍅", buyPrice: 50, sellPrice: 100, harvestTime: 180 * 60 * 1000 }, // 15 phút
    "strawberry": { emoji: "🍓", buyPrice: 80, sellPrice: 160, harvestTime: 240 * 60 * 1000 }, // 30 phút
    "orange": { emoji: "🍊", buyPrice: 90, sellPrice: 180, harvestTime: 360 * 60 * 1000 }, // 40 phút
    "apple": { emoji: "🍏", buyPrice: 100, sellPrice: 200, harvestTime: 0 * 60 * 1000 }, // 45 phút
    "grape": { emoji: "🍇", buyPrice: 120, sellPrice: 240, harvestTime: 540 * 60 * 1000 }, // 1 giờ
    "watermelon": { emoji: "🍉", buyPrice: 150, sellPrice: 300, harvestTime: 600 * 60 * 1000 } // 1.5 giờ
};

module.exports = { crops };
