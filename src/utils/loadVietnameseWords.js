const fs = require('fs');
const path = require('path');

let wordSet = new Set();

function loadWords() {
    const data = fs.readFileSync(path.join(__dirname, '../data/dataWordGame.txt'), 'utf8');
    wordSet = new Set(data.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => w));
}

function getWordSet() {
    return wordSet;
}

// Tải từ ban đầu khi khởi động
loadWords();

module.exports = {
    loadWords,
    getWordSet
};
