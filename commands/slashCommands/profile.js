import { generateProfileEmbed } from '../../utils/discord/embeds.js';
import { candidateSessionsMap } from '../../data/state.js';
import { createProfileCommandButtons } from '../../utils/discord/buttons.js';

/**
 * Handles the profile command.
 * Fetches user or target user data, calculates session statistics,
 * generates a profile embed, and sends it along with command buttons.
 */
export default async function handleProfile(interaction) {
    const { options, user: invokingUser, guild } = interaction;
    const userOption = options.getUser('user');
    const user = userOption ?? invokingUser; // Target user defaults to invoking user if no user given
    const userId = user.id;

    // Defer reply to avoid timeout
    await interaction.deferReply({ flags: 64 });

    // Prevent viewing a bot's profile
    if (userOption && userOption.bot) {
        return await interaction.editReply({
            content: '❌ You cannot view the profile of a bot.',
        });
    }

    // Fetch member object for more detailed info (roles, nickname, etc.)
    let member;
    try {
        member = await guild.members.fetch(userId);
    } catch (err) {
        console.error('❗ Failed to fetch member for profile:', err);
        member = null;
    }

    // Calculate session stats for the profile
    const sessionStats = {
        totalSessions: countSessions(userId),
        verifiedSessions: countVerifiedSessions(userId),
        averageMarks: calculateAveragePercentage(userId),
        highestMarks: getHighestMarks(userId),
        recentSession: getMostRecentSession(userId),
    };

    // Generate embed for profile
    const embed = generateProfileEmbed(user, member, sessionStats);
    if (!embed) {
        return await interaction.editReply({
            content: '❌ Could not generate profile embed.',
        });
    }

    // Add button for profile interactions (View All Sessions)
    const buttonsRow = createProfileCommandButtons();

    // Send final profile embed with buttons
    await interaction.editReply({
        embeds: [embed],
        components: [buttonsRow],
    });
}

/**
 * Counts all sessions for a user.
 */
function countSessions(userId) {
    let sessionCount = 0;
    for (const key of candidateSessionsMap.keys()) {
        // Keys are composite: "userId::channelId" or similar
        if (key.startsWith(`${userId}`)) sessionCount++;
    }
    return sessionCount;
}

/**
 * Counts verified sessions for a user.
 */
function countVerifiedSessions(userId) {
    let verifiedCount = 0;
    for (const [key, session] of candidateSessionsMap.entries()) {
        if (key.startsWith(`${userId}::`) && session.verified) verifiedCount++;
    }
    return verifiedCount;
}

/**
 * Calculates the average marks percentage across verified sessions.
 */
function calculateAveragePercentage(userId) {
    let totalEarned = 0;
    let totalMax = 0;

    for (const [key, session] of candidateSessionsMap.entries()) {
        if (key.startsWith(`${userId}::`) && typeof session.marks === 'string') {
            const parsed = parseMarkPair(session.marks);
            if (parsed) {
                totalEarned += parsed.scored;
                totalMax += parsed.total;
            }
        }
    }

    if (totalMax === 0) return null;

    return ((totalEarned / totalMax) * 100).toFixed(2);
}

/**
 * Finds the highest marks scored by the user in any session.
 */
function getHighestMarks(userId) {
    let highest = 0;
    for (const [key, session] of candidateSessionsMap.entries()) {
        if (key.startsWith(`${userId}::`) && typeof session.marks === 'string') {
            const parsed = parseMarkPair(session.marks);
            if (parsed && parsed.scored > highest) highest = parsed.scored;
        }
    }
    return highest;
}

/**
 * Gets the most recent session for the user.
 */
function getMostRecentSession(userId) {
    let mostRecentSession = null;
    let latestTimestamp = 0;

    for (const [key, session] of candidateSessionsMap.entries()) {
        if (key.startsWith(`${userId}::`) && session.createdAt > latestTimestamp) {
            latestTimestamp = session.createdAt;
            mostRecentSession = session;
        }
    }

    return mostRecentSession;
}

/**
 * Parses a marks string like "70/100" into numeric scored and total.
 * Returns null if invalid.
 */
function parseMarkPair(markStr) {
    if (typeof markStr !== 'string' || !markStr.includes('/')) return null;

    const [scoredStr, totalStr] = markStr.split('/');
    const scored = parseFloat(scoredStr);
    const total = parseFloat(totalStr);

    return !isNaN(scored) && !isNaN(total) && total > 0 ? { scored, total } : null;
}
