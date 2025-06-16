const mongoose = require('mongoose');

const imageChannelSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
});

module.exports = mongoose.model('ImageChannel', imageChannelSchema);
