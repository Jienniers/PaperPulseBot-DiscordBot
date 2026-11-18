import formatPaperTime from '../../utils/common/time.js';
import { getSession, setGuildField } from '../../utils/database/guildData.js';

// Centralized messages
const MESSAGES = {
    noExaminer: '❌ Examiner not found for this session.',
    sessionRunning:
        '✅ The paper session in this channel is already complete or is running. No more users can be added.',
    noUsersMentioned: '❌ No users mentioned.',
    noValidUsers: '❌ No valid users to add. All mentioned users were either bots or the examiner.',
    skippedUsers:
        '⚠️ Some mentioned users were skipped because they were either bots or the examiner.',
    onlyExaminerAllowed: 'Only examiners are allowed to run this command.',
};

// store intervals for cleanup
export const paperTimerIntervals = new Map();

/**
 * Validates the !add command input and returns candidates to add
 */
async function validateAddCommand(message) {
    const channelID = message.channel.id;

    const session = await getSession(message.guild.id, channelID);

    if (!session) {
        console.log('Session not found', message.guildId, channelID);
        return null;
    }

    const paperTimeMins = session.paperTimeMins;
    const examinerId = session.examinerId;

    if (message.author.id !== examinerId) throw { key: 'onlyExaminerAllowed' };
    if (!examinerId) throw { key: 'noExaminer' };
    if (paperTimerIntervals.has(channelID)) throw { key: 'sessionRunning' };

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

    return { validCandidates, skipped, paperTimeMins, examinerId };
}

/**
 * Handles the !add command: adds candidates and starts the paper timer
 */
export default async function handleAddCommand(message) {
    if (!message.content.startsWith('!add')) return;

    let validationResult;
    try {
        validationResult = await validateAddCommand(message);
        if (!validationResult) return;
    } catch (err) {
        const content = MESSAGES[err.key] ?? '❌ An unknown error occurred.';
        return await message.reply(content);
    }

    const { validCandidates, skipped, paperTimeMins } = validationResult;
    const channel = message.channel;

    // Actually create candidate sessions here
    await Promise.all(validCandidates.map((user) => createCandidateSessionEntry(user, message)));

    if (skipped) await message.reply(MESSAGES.skippedUsers);

    const candidateMentions = validCandidates.map((u) => u.toString()).join(' ');
    await channel.send(`📝 Following candidates have been added: ${candidateMentions}`);

    // set paper running status to true in state
    await setGuildField(message.guild.id, `sessions.${channel.id}.status`, true);

    await startPaperTimer(channel, paperTimeMins, message.guild.id);
}

/**
 * Starts the paper timer and sends updates
 */
async function startPaperTimer(channel, paperMinutes, guildID) {
    let remaining = isNaN(Number(paperMinutes)) ? 0 : Number(paperMinutes);

    const timerMsg = await channel.send(
        `📝 Candidates, please begin your paper.\n⏱️ Total time: **${formatPaperTime(remaining)}**`,
    );

    const warningThresholds = new Set([5, 1]); // Warning at 5 min and 1 min marks

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

            // set paper running status to false in state
            try {
                await setGuildField(guildID, `sessions.${channel.id}.status`, false);
            } catch (error) {
                console.error('[database] Failed to persist completed timer state:', error);
            }
            return;
        }

        await timerMsg.edit(
            `📝 Candidates, keep working.\n⏱️ Time remaining: **${formatPaperTime(remaining)}**`,
        );
    }, 60_000);

    // store interval ID for cleanup later
    paperTimerIntervals.set(channel.id, interval);
}

async function createCandidateSessionEntry(user, message) {
    const guildId = message.guild.id;
    const channelID = message.channel.id;

    const candidate = {
        userId: user.id,
        verified: false,
        marks: null,
        addedAt: Date.now(),
    };
    await setGuildField(guildId, `sessions.${channelID}.candidates.${user.id}`, candidate);
}
