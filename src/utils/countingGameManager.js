const countingState = {}; // { [channelId]: { lastNumber: number, lastUserId: string } }

function startCounting(channelId) {
    countingState[channelId] = {
        lastNumber: 0,
        lastUserId: null
    };
}

function stopCounting(channelId) {
    delete countingState[channelId];
}

function getState(channelId) {
    return countingState[channelId];
}

function updateState(channelId, userId, number) {
    if (!countingState[channelId]) return;
    countingState[channelId].lastNumber = number;
    countingState[channelId].lastUserId = userId;
}

function isValidCount(channelId, message) {
    const state = countingState[channelId];
    if (!state) return false;

    const number = parseInt(message.content.trim());
    if (isNaN(number)) return false;

    // Không cho cùng người liên tiếp
    if (message.author.id === state.lastUserId) return false;

    return number === state.lastNumber + 1;
}

async function handleCount(message) {
    const channelId = message.channel.id;
    const state = countingState[channelId];
    if (!state) return;

    const number = parseInt(message.content.trim());
    if (isNaN(number)) {
        await message.delete();
        return;
    };

    if (message.author.id === state.lastUserId || number !== state.lastNumber + 1) {
        try {
            message.author.id === state.lastUserId ? await message.react('⚠️') : await message.react('❌'); //  Xóa tin nhắn sai
            // Optionally: Gửi cảnh báo tạm thời
            await message.channel.send(`${message.author}, bạn không thể gửi liên tiếp hoặc sai số!`).then(msg => {
                setTimeout(() => msg.delete().catch(() => { }), 3000);
            });
        } catch (err) {
            console.error('Không thể xóa tin nhắn sai:', err);
        }
        return;
    }

    await message.react('✅');
    updateState(channelId, message.author.id, number);
}


module.exports = {
    startCounting,
    stopCounting,
    getState,
    updateState,
    isValidCount,
    handleCount
};
