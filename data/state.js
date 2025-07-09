// 📦 state.js
// This file stores globally shared runtime variables (e.g., maps and arrays)
// used across different modules in the bot to maintain session states and data consistency.
const examinersMap = new Map();
const candidatesMap = new Map();
const paperChannels = [];
const paperTimeMinsMap = new Map();
const paperRunningMap = new Map();
const verifiedCandidates = new Map();

function doubleKeyMaps(firstKey, SecondKey) {
    const key = `${firstKey}::${SecondKey}`;
    return key;
}

module.exports = {
    examinersMap,
    candidatesMap,
    paperChannels,
    paperTimeMinsMap,
    paperRunningMap,
    verifiedCandidates,
    doubleKeyMaps
};
