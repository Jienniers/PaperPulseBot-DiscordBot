const path = require('path');
const { generateProfileEmbed } = require(path.resolve(__dirname, '..', '..', 'utils', 'embeds.js'));

const { candidateSessionsMap } = require(path.resolve(__dirname, '..', '..', 'data', 'state.js'));

const { createProfileCommandButtons } = require(
    path.resolve(__dirname, '..', '..', 'utils', 'buttons.js'),
);

async function handleProfile(interaction) {
    let member;
    const userOption = interaction.options.getUser('user');
    const user = userOption ?? interaction.user;
    const userId = user.id;


    if (userOption.bot) {
        return await interaction.reply({
            content: '❌ You cannot view the profile of a bot.',
        });
    }

    try {
        member = await interaction.guild.members.fetch(userId);
    } catch (err) {
        console.error('Failed to fetch member:', err);
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

    const buttonsRow = createProfileCommandButtons();

    await interaction.reply({
        embeds: [embed],
        components: [buttonsRow],
    });
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

function countSessions(userId) {
    let sessionCount = 0;
    for (const key of candidateSessionsMap.keys()) {
        if (key.startsWith(`${userId}`)) {
            sessionCount++;
        }
    }
    return sessionCount;
}

function calculateAveragePercentage(userId) {
    let totalEarned = 0;
    let totalMax = 0;

    for (const [key, session] of candidateSessionsMap.entries()) {
        if (key.startsWith(`${userId}::`) && typeof session.marks === 'string') {
            const [earnedStr, maxStr] = session.marks.split('/');
            const earned = parseFloat(earnedStr);
            const max = parseFloat(maxStr);

            if (!isNaN(earned) && !isNaN(max) && max > 0) {
                totalEarned += earned;
                totalMax += max;
            }
        }
    }

    if (totalMax === 0) return null;

    return ((totalEarned / totalMax) * 100).toFixed(2);
}

function getHighestMarks(userId) {
    let highest = 0;

    for (const [key, session] of candidateSessionsMap.entries()) {
        if (key.startsWith(`${userId}::`) && session.marks) {
            const [scoredStr] = session.marks.split('/');
            const scored = parseFloat(scoredStr);
            if (!isNaN(scored) && scored > highest) {
                highest = scored;
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

module.exports = {
    handleProfile,
};
