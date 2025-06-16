const ImageChannel = require('../model/imageChannelModel');

async function setImageChannel(guildId, channelId) {
    return await ImageChannel.findOneAndUpdate(
        { guildId },
        { channelId },
        { upsert: true, new: true }
    );
}

module.exports = {
    setImageChannel,
};
