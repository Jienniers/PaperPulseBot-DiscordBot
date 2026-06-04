import { state } from '../../data/state.js';
import formatPaperTime from '../../utils/common/time.js';

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
    const channelID = message.channel.id;

    const session = state.guilds?.[message.guild.id]?.sessions?.[channelID];

    if (!session) {
        console.log('Session not found', message.guildId, channelID);
        return null;
    }

    const paperTimeMins = session.paperTimeMins;
    const examinerId = session.examinerId;

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
        validationResult = validateAddCommand(message);
        if (!validationResult) return;
    } catch (err) {
        const content = MESSAGES[err.key] ?? '❌ An unknown error occurred.';
        return await message.reply(content);
    }

    const { validCandidates, skipped, paperTimeMins } = validationResult;
    const channel = message.channel;

    // Actually create candidate sessions here
    for (const user of validCandidates) {
        createCandidateSessionEntry(user, message, false, null);
    }

    if (skipped) await message.reply(MESSAGES.skippedUsers);

    const candidateMentions = validCandidates.map((u) => u.toString()).join(' ');
    await channel.send(`📝 Following candidates have been added: ${candidateMentions}`);

    // set paper running status to true in state
    state.guilds[message.guild.id].sessions[channel.id].status = true;

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
            state.guilds[guildID].sessions[channel.id].status = false;
            return;
        }

        await timerMsg.edit(
            `📝 Candidates, keep working.\n⏱️ Time remaining: **${formatPaperTime(remaining)}**`,
        );
    }, 60_000);

    // store interval ID for cleanup later
    paperTimerIntervals.set(channel.id, interval);
}

function createCandidateSessionEntry(user, message, verified = false, marks = null) {
    const guildId = message.guild.id;
    const channelID = message.channel.id;

    // ensure structure exists
    if (!state.guilds[guildId]) {
        state.guilds[guildId] = { sessions: {} };
    }

    if (!state.guilds[guildId].sessions[channelID]) {
        state.guilds[guildId].sessions[channelID] = {
            examinerId: null,
            categoryId: null,
            paperTimeMins: null,
            createdAt: Date.now(),
            candidates: {},
        };
    }

    const session = state.guilds[guildId].sessions[channelID];

    // store candidate inside session
    session.candidates[user.id] = {
        userId: user.id,
        verified,
        marks, // "70/100"
        submittedAt: Date.now(),
    };
}
