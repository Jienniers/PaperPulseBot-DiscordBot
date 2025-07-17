const path = require('path');
const { formatPaperTime } = require(path.resolve(__dirname, '..', '..', 'utils', 'time.js'));

const { paperChannels, paperTimeMinsMap, paperRunningMap, createCandidateSessionEntry, examinersMap } = require(
    path.resolve(__dirname, '..', '..', 'data', 'state.js'),
);

// Handles the !add command: adds mentioned users as candidates for the current paper session
async function handleAddCommand(message) {
    if (!message.content.startsWith('!add')) return;

    const channelId = message.channel.id

    if (!paperChannels.includes(channelId)) return;

    const paperTimeMins = paperTimeMinsMap.get(channelId);
    const examinerId = examinersMap.get(channelId).id;

    if (paperRunningMap.has(channelId)) {
        await message.reply(
            '✅ The paper session in this channel is already complete or is running. No more users can be added.',
        );
        return;
    }

    const mentionedUsers = message.mentions.users;
    if (mentionedUsers.size === 0) {
        await message.reply('❌ No users mentioned.');
        return;
    }
    const sessionCandidates = [];

    let validUsersAdded = false;
    let skipped = false;

    for (const user of mentionedUsers.values()) {
        if (user.bot || user.id === examinerId) {
            skipped = true;
            continue;
        }

        sessionCandidates.push(user);
        createCandidateSessionEntry(user, message, false, null);
        validUsersAdded = true;
    }

    if (!validUsersAdded) {
        await message.reply('❌ No valid users to add. All mentioned users were either bots or the examiner.');
        return;
    }

    if (skipped) {
        await message.reply('⚠️ Some mentioned users were skipped because they were either bots or the examiner.');
    }

    const candidateNames = sessionCandidates.map((user) => user.toString()).join(' ');

    message.channel.send(`📝 Following candidates have been added: ${candidateNames}`);

    paperRunningMap.set(channelId, true);

    await startPaperTimer(message.channel, paperTimeMins);
}

async function startPaperTimer(channel, paperMinutes) {
    const totalMinutes = Number(paperMinutes);
    let remaining = isNaN(totalMinutes) ? 0 : totalMinutes;

    const timerMsg = await channel.send(
        `📝 Candidates, please begin your paper.\n⏱️ Time remaining: **${formatPaperTime(remaining)}**`,
    );

    const interval = setInterval(async () => {
        remaining -= 1;

        if (remaining <= 0) {
            clearInterval(interval);

            await timerMsg.edit(`⏰ **Time's up!** Please stop writing and put your pen down.`);

            await channel.send(`⏰ **Time's up!** Please stop writing and put your pen down.`);

            paperRunningMap.set(channel.id, false);
            return;
        }

        await timerMsg.edit(
            `📝 Candidates, keep working.\n⏱️ Time remaining: **${formatPaperTime(remaining)}**`,
        );
    }, 60_000);
}

module.exports = {
    handleAddCommand,
    paperRunningMap,
};
