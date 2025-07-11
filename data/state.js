// 📦 state.js
// This file stores globally shared runtime variables (e.g., maps and arrays)
// used across different modules in the bot to maintain session states and data consistency.
const examinersMap = new Map();
const paperChannels = [];
const paperTimeMinsMap = new Map();
const paperRunningMap = new Map();
const candidateSessionsMap = new Map()


function doubleKeyMaps(firstKey, SecondKey) {
    const key = `${firstKey}::${SecondKey}`;
    return key;
}

module.exports = {
    examinersMap,
    paperChannels,
    paperTimeMinsMap,
    paperRunningMap,
    candidateSessionsMap,
    doubleKeyMaps,
};
