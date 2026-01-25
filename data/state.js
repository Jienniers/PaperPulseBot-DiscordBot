// 📦 state.js
// This file stores globally shared runtime variables (e.g., maps and arrays)
// used across different modules in the bot to maintain session states and data consistency.

const examinersMap = new Map(); // channelId -> examinerId
let paperChannels = []; // list of active paper channel IDs
const paperTimeMinsMap = new Map(); // channelId -> duration in minutes
const paperRunningMap = new Map(); // channelId -> boolean, is paper running
const candidateSessionsMap = new Map(); // compositeKey -> candidate session data

/**
 * Generates a unique composite key for candidate sessions.
 * @param {string} firstKey - Typically the userId
 * @param {string} secondKey - Typically the channelId
 * @returns {string} composite key in format "firstKey::secondKey"
 */
function generateCompositeKey(firstKey, secondKey) {
    const key = `${firstKey}::${secondKey}`;
    return key;
}

function createCandidateSessionEntry(user, message, verified = false, marks = null) {
    const key = generateCompositeKey(user.id, message.channel.id);
    candidateSessionsMap.set(key, {
        userId: user.id,
        channelId: message.channel.id,
        verified,
        marks, // Marks string like "70/100"
        examinerId: examinersMap.get(message.channel.id) || null,
        guildId: message.guild.id,
        createdAt: Date.now(),
    });
}

export {
    examinersMap,
    paperChannels,
    paperTimeMinsMap,
    paperRunningMap,
    candidateSessionsMap,
    generateCompositeKey,
    createCandidateSessionEntry,
};
