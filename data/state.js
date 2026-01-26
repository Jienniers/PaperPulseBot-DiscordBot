// 📦 state.js
// This file stores globally shared runtime variables (e.g., maps and arrays)
// used across different modules in the bot to maintain session states and data consistency.

const COMPOSITE_KEY_SEPARATOR = '::'; // Separator for composite keys (userId::channelId)

const examinersMap = new Map(); // channelId -> examinerId
let paperChannels = []; // list of active paper channel IDs
const paperTimeMinsMap = new Map(); // channelId -> duration in minutes
const paperRunningMap = new Map(); // channelId -> boolean, is paper running
const candidateSessionsMap = new Map(); // compositeKey (userId::channelId) -> candidate session data

/**
 * Generates a unique composite key for candidate sessions.
 * Format: "userId::channelId"
 *
 * @param {string} userId - The candidate user ID
 * @param {string} channelId - The paper session channel ID
 * @returns {string} Composite key in format "userId::channelId"
 */
function generateCompositeKey(userId, channelId) {
    return `${userId}${COMPOSITE_KEY_SEPARATOR}${channelId}`;
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
    COMPOSITE_KEY_SEPARATOR,
};
