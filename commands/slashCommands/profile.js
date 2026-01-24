import { generateProfileEmbed } from '../../utils/discord/embeds.js';
import { candidateSessionsMap } from '../../data/state.js';
import { createProfileCommandButtons } from '../../utils/discord/buttons.js';

export default async function handleProfile(interaction) {
    const userOption = interaction.options.getUser('user');
    const user = userOption ?? interaction.user;
    const userId = user.id;

    await interaction.deferReply({ flags: 64 });

    if (userOption && userOption.bot) {
        return await interaction.editReply({
            content: '❌ You cannot view the profile of a bot.',
        });
    }

    let member;
    try {
        member = await interaction.guild.members.fetch(userId);
    } catch (err) {
        console.error('❗ Failed to fetch member for profile:', err);
        member = null;
    }

    const sessionStats = {
        totalSessions: countSessions(userId),
        verifiedSessions: countVerifiedSessions(userId),
        averageMarks: calculateAveragePercentage(userId),
        highestMarks: getHighestMarks(userId),
        recentSession: getMostRecentSession(userId),
    };

    const embed = generateProfileEmbed(user, member, sessionStats);
    if (!embed) {
        return await interaction.editReply({
            content: '❌ Could not generate profile embed.',
        });
    }

    const buttonsRow = createProfileCommandButtons();

    await interaction.editReply({
        embeds: [embed],
        components: [buttonsRow],
    });
}

function countSessions(userId) {
    let sessionCount = 0;
    for (const key of candidateSessionsMap.keys()) {
        if (key.startsWith(`${userId}`)) {
            sessionCount++;
        }
    }
    return sessionCount;
}

function countVerifiedSessions(userId) {
    let verifiedCount = 0;
    for (const [key, session] of candidateSessionsMap.entries()) {
        if (key.startsWith(`${userId}::`) && session.verified) {
            verifiedCount++;
        }
    }
    return verifiedCount;
}

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

function getHighestMarks(userId) {
    let highest = 0;
    for (const [key, session] of candidateSessionsMap.entries()) {
        if (key.startsWith(`${userId}::`) && typeof session.marks === 'string') {
            const parsed = parseMarkPair(session.marks);
            if (parsed && parsed.scored > highest) {
                highest = parsed.scored;
            }
        }
    }
    return highest;
}

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

function parseMarkPair(markStr) {
    if (typeof markStr !== 'string' || !markStr.includes('/')) return null;
    const [scoredStr, totalStr] = markStr.split('/');
    const scored = parseFloat(scoredStr);
    const total = parseFloat(totalStr);
    return !isNaN(scored) && !isNaN(total) && total > 0 ? { scored, total } : null;
}
