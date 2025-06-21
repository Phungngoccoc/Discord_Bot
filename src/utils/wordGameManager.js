const { getWordSet } = require('./loadVietnameseWords');

const gameState = {}; // Shared game state by channel

function startGame(channelId) {
    gameState[channelId] = {
        currentWord: null,
        started: true,
        usedWords: new Set()
    };
}

function stopGame(channelId) {
    if (gameState[channelId]) {
        gameState[channelId].started = false;
    }
}

function getState(channelId) {
    return gameState[channelId];
}

function isValidWord(word) {
    const validWords = getWordSet();
    return validWords.has(word.toLowerCase());
}

function isEligibleWord(word) {
    const cleaned = word.trim().replace(/\s+/g, ' ').normalize('NFC');
    const parts = cleaned.split(' ');
    const validPattern = /^[\p{L} ]+$/u;

    return parts.length === 2 && validPattern.test(cleaned);
}


function getFirstSyllable(word) {
    return word.trim().split(/\s+/)[0];
}

function getLastSyllable(word) {
    const parts = word.trim().split(/\s+/);
    return parts[parts.length - 1];
}

function isNextValid(prev, current) {
    if (!prev || !current) return false;
    const last = getLastSyllable(prev).normalize('NFC');
    const first = getFirstSyllable(current).normalize('NFC');
    return last === first;
}

function hasNextWord(word, usedWords) {
    const validWords = getWordSet();
    const last = getLastSyllable(word).normalize('NFC');
    return Array.from(validWords).some(w => {
        const first = getFirstSyllable(w).normalize('NFC');
        return first === last && !usedWords.has(w);
    });
}

module.exports = {
    startGame,
    stopGame,
    getState,
    isValidWord,
    isEligibleWord,
    isNextValid,
    hasNextWord
};