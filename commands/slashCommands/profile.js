import { getGuildData } from '../../utils/database/guildData.js';
import { createProfileCommandButtons } from '../../utils/discord/buttons.js';
import { generateProfileEmbed } from '../../utils/discord/embeds.js';

/**
 * Handles the profile command.
 */
export default async function handleProfile(interaction) {
    const { options, user: invokingUser, guild, guildId } = interaction;

    const userOption = options.getUser('user');
    const user = userOption ?? invokingUser;
    const userId = user.id;

    await interaction.deferReply({ flags: 64 });

    let guildData;
    try {
        guildData = await getGuildData(guildId);
    } catch {
        return interaction.editReply({
            content: '❌ Could not load profile data. Please try again.',
        });
    }

    if (userOption?.bot) {
        return interaction.editReply({
            content: '❌ You cannot view the profile of a bot.',
        });
    }

    // Fetch member (nickname, roles, etc.)
    let member = null;
    try {
        member = await guild.members.fetch(userId);
    } catch {
        member = null;
    }

    // Stats
    const sessionStats = {
        totalSessions: countSessions(guildData, userId),
        verifiedSessions: countVerifiedSessions(guildData, userId),
        averageMarks: calculateAveragePercentage(guildData, userId),
        highestMarks: getHighestMarks(guildData, userId),
        recentSession: getMostRecentSession(guildData, userId),
    };

    const embed = generateProfileEmbed(user, member, sessionStats);

    if (!embed) {
        return interaction.editReply({
            content: '❌ Could not generate profile embed.',
        });
    }

    const buttonsRow = createProfileCommandButtons(userId);

    await interaction.editReply({
        embeds: [embed],
        components: [buttonsRow],
    });
}

/* =======================
   Helpers (NEW STATE MODEL)
   ======================= */

function countSessions(guild, userId) {
    if (!guild?.sessions) return 0;

    let count = 0;

    for (const session of Object.values(guild.sessions)) {
        if (session.candidates?.[userId]) {
            count++;
        }
    }

    return count;
}

function countVerifiedSessions(guild, userId) {
    if (!guild?.sessions) return 0;

    let count = 0;

    for (const session of Object.values(guild.sessions)) {
        const candidate = session.candidates?.[userId];
        if (candidate?.verified) {
            count++;
        }
    }

    return count;
}

function calculateAveragePercentage(guild, userId) {
    if (!guild?.sessions) return null;

    let totalEarned = 0;
    let totalMax = 0;

    for (const session of Object.values(guild.sessions)) {
        const candidate = session.candidates?.[userId];
        if (!candidate?.marks) continue;

        const parsed = parseMarkPair(candidate.marks);
        if (!parsed) continue;

        totalEarned += parsed.scored;
        totalMax += parsed.total;
    }

    if (totalMax === 0) return null;

    return ((totalEarned / totalMax) * 100).toFixed(2);
}

function getHighestMarks(guild, userId) {
    if (!guild?.sessions) return 0;

    let highest = 0;

    for (const session of Object.values(guild.sessions)) {
        const candidate = session.candidates?.[userId];
        if (!candidate?.marks) continue;

        const parsed = parseMarkPair(candidate.marks);
        if (parsed && parsed.scored > highest) {
            highest = parsed.scored;
        }
    }

    return highest;
}

function getMostRecentSession(guild, userId) {
    if (!guild?.sessions) return null;

    let latestSession = null;
    let latestTime = 0;

    for (const [channelID, session] of Object.entries(guild.sessions)) {
        const candidate = session.candidates?.[userId];
        if (!candidate) continue;

        const candidateAddedAt = candidate.addedAt ?? candidate.submittedAt;
        const timestamp = candidateAddedAt || session.createdAt || 0;

        if (timestamp > latestTime) {
            latestTime = timestamp;

            latestSession = {
                channelID,
                examinerId: session.examinerId,
                marks: candidate.marks,
                verified: candidate.verified,
                createdAt: session.createdAt ?? candidateAddedAt,
            };
        }
    }

    return latestSession;
}

function parseMarkPair(markStr) {
    if (typeof markStr !== 'string' || !markStr.includes('/')) return null;

    const [scoredStr, totalStr] = markStr.split('/');
    const scored = parseFloat(scoredStr);
    const total = parseFloat(totalStr);

    return !isNaN(scored) && !isNaN(total) && total > 0 ? { scored, total } : null;
}
