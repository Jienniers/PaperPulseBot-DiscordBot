const path = require('path');
const { formatPaperTime } = require(path.resolve(__dirname, '..', 'utils', 'time.js'));

const paperRunningMap = new Map()

// Handles the !add command: adds mentioned users as candidates for the current paper session
async function handleAddCommand(message, paperChannels, candidatesMap, paperTimeMins) {
    if (!message.content.startsWith("!add")) return;
    if (!paperChannels.includes(message.channel.id)) return;

    if (paperRunningMap.has(message.channel.id)) {
        await message.reply("✅ The paper session in this channel is already complete or is running. No more users can be added.");
        return;
    }

    const mentionedUsers = message.mentions.users;
    if (mentionedUsers.size === 0) {
        message.reply("❌ No users mentioned.");
        return;
    }

    const sessionCandidates = candidatesMap.get(message.channel.id) || [];
    mentionedUsers.forEach(user => {
        sessionCandidates.push(user);
    });

    const candidateNames = sessionCandidates.map(user => user.toString()).join(' ');

    message.channel.send(`📝 Following candidates have been added: ${candidateNames}`);

    paperRunningMap.set(message.channel.id, false)

    await startPaperTimer(message.channel, paperTimeMins);

    paperRunningMap.set(message.channel.id, true)
}

async function startPaperTimer(channel, paperMinutes) {
    const totalMinutes = Number(paperMinutes);
    let remaining = isNaN(totalMinutes) ? 0 : totalMinutes;

    const timerMsg = await channel.send(
        `📝 Candidates, please begin your paper.\n⏱️ Time remaining: **${formatPaperTime(remaining)}**`
    );

    const interval = setInterval(async () => {
        remaining -= 1;

        if (remaining <= 0) {
            clearInterval(interval);

            await timerMsg.edit(
                `⏰ **Time's up!** Please stop writing and put your pen down.`
            );

            await channel.send(
                `⏰ **Time's up!** Please stop writing and put your pen down.`
            );

            paperRunningMap.set(message.channel.id, false)
            return;
        }

        await timerMsg.edit(
            `📝 Candidates, keep working.\n⏱️ Time remaining: **${formatPaperTime(remaining)}**`
        );
    }, 60_000);
}

module.exports = {
    handleAddCommand,
    paperRunningMap
};