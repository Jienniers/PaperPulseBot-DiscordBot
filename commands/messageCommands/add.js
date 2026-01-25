import formatPaperTime from '../../utils/common/time.js';
import {
    paperChannels,
    paperTimeMinsMap,
    paperRunningMap,
    createCandidateSessionEntry,
    examinersMap,
} from '../../data/state.js';

// Centralized messages
const MESSAGES = {
    noExaminer: '❌ Examiner not found for this session.',
    sessionRunning:
        '✅ The paper session in this channel is already complete or is running. No more users can be added.',
    noUsersMentioned: '❌ No users mentioned.',
    noValidUsers: '❌ No valid users to add. All mentioned users were either bots or the examiner.',
    skippedUsers:
        '⚠️ Some mentioned users were skipped because they were either bots or the examiner.',
};

// store intervals for cleanup
const paperTimerIntervals = new Map();

/**
 * Validates the !add command input and returns candidates to add
 */
function validateAddCommand(message) {
    const channelId = message.channel.id;

    if (!paperChannels.includes(channelId)) return null;

    const paperTimeMins = paperTimeMinsMap.get(channelId);
    const examinerId = examinersMap.get(channelId);

    if (!examinerId) throw { key: 'noExaminer' };
    if (paperRunningMap.has(channelId)) throw { key: 'sessionRunning' };

    const mentionedUsers = message.mentions.users;
    if (mentionedUsers.size === 0) throw { key: 'noUsersMentioned' };

    const validCandidates = [];
    let skipped = false;

    for (const user of mentionedUsers.values()) {
        if (user.bot || user.id === examinerId) {
            skipped = true;
            continue;
        }
        validCandidates.push(user); // only collect valid users
    }

    if (validCandidates.length === 0) throw { key: 'noValidUsers' };

    return { validCandidates, skipped, paperTimeMins, channelId, examinerId };
}

/**
 * Handles the !add command: adds candidates and starts the paper timer
 */
export default async function handleAddCommand(message) {
    if (!message.content.startsWith('!add')) return;

    let data;
    try {
        data = validateAddCommand(message);
        if (!data) return;
    } catch (err) {
        const content = MESSAGES[err.key] ?? '❌ An unknown error occurred.';
        return await message.reply(content);
    }

    const { validCandidates, skipped, paperTimeMins, channelId } = data;
    const channel = message.channel;

    // Actually create candidate sessions here
    for (const user of validCandidates) {
        createCandidateSessionEntry(user, message, false, null);
    }

    if (skipped) await message.reply(MESSAGES.skippedUsers);

    const candidateMentions = validCandidates.map((u) => u.toString()).join(' ');
    await channel.send(`📝 Following candidates have been added: ${candidateMentions}`);

    paperRunningMap.set(channelId, true);
    await startPaperTimer(channel, paperTimeMins);
}

/**
 * Starts the paper timer and sends updates
 */
async function startPaperTimer(channel, paperMinutes) {
    let remaining = isNaN(Number(paperMinutes)) ? 0 : Number(paperMinutes);

    const timerMsg = await channel.send(
        `📝 Candidates, please begin your paper.\n⏱️ Time remaining: **${formatPaperTime(remaining)}**`,
    );

    const warningThresholds = new Set([5, 1]);

    const interval = setInterval(async () => {
        remaining -= 1;

        if (warningThresholds.has(remaining)) {
            await channel.send(
                `⚠️ **${remaining} minute${remaining === 1 ? '' : 's'} remaining!** Keep working.`,
            );
        }

        if (remaining <= 0) {
            clearInterval(interval);
            paperTimerIntervals.delete(channel.id);
            await timerMsg.edit(`⏰ **Time's up!** Please stop writing and put your pen down.`);
            await channel.send(`⏰ **Time's up!** Please stop writing and put your pen down.`);
            paperRunningMap.set(channel.id, false);
            return;
        }

        await timerMsg.edit(
            `📝 Candidates, keep working.\n⏱️ Time remaining: **${formatPaperTime(remaining)}**`,
        );
    }, 60_000);

    // store interval ID for cleanup later
    paperTimerIntervals.set(channel.id, interval);
}

// cleanup on shutdown
process.on('SIGINT', () => {
    for (const interval of paperTimerIntervals.values()) clearInterval(interval);
    process.exit(0);
});

process.on('SIGTERM', () => {
    for (const interval of paperTimerIntervals.values()) clearInterval(interval);
    process.exit(0);
});
