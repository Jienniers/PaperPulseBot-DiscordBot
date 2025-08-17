// 📦 state.js
// This file stores globally shared runtime variables (e.g., maps and arrays)
// used across different modules in the bot to maintain session states and data consistency.
const examinersMap = new Map();
const paperChannels = [];
const paperTimeMinsMap = new Map();
const paperRunningMap = new Map();
const candidateSessionsMap = new Map();

function doubleKeyMaps(firstKey, SecondKey) {
    const key = `${firstKey}::${SecondKey}`;
    return key;
}

function createCandidateSessionEntry(user, message, verified, marks) {
    const key = doubleKeyMaps(user.id, message.channel.id);
    candidateSessionsMap.set(key, {
        userId: user.id,
        channelId: message.channel.id,
        verified: verified,
        marks: marks,
        examinerId: examinersMap.get(message.channel.id) || null,
        guildId: message.guild.id,
        createdAt: Date.now(),
    });
}

module.exports = {
    examinersMap,
    paperChannels,
    paperTimeMinsMap,
    paperRunningMap,
    candidateSessionsMap,
    doubleKeyMaps,
    createCandidateSessionEntry,
};
