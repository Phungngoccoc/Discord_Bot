const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    wordGameChannelId: { type: String, required: false },
    countingChannelId: { type: String },
    logMessageChannelId: { type: String },
    welcomeChannelId: { type: String, default: null },
    welcomeEmbed: {
        title: String,
        description: String,
        image: String,
        footer: String,
        color: String
    },
    goodbyeChannelId: { type: String, default: null },
    goodbyeEmbed: {
        title: String,
        description: String,
        image: String,
        footer: String,
        color: String
    },
    boostChannelId: { type: String, default: null },
    boostEmbed: {
        title: String,
        description: String,
        image: String,
        footer: String,
        color: String
    }
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);