const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    wordGameChannelId: { type: String, required: false },
    logMessageChannelId: { type: String },
    welcomeChannelId: { type: String, default: null },
    welcomeEmbed: {
        title: String,
        description: String,
        image: String,
        footer: String,
        color: String
    }
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);