// Handles the !add command: adds mentioned users as candidates for the current paper session
function handleAddCommand(message, paperChannels, candidatesMap) {
    if (!message.content.startsWith("!add")) return;
    if (!paperChannels.includes(message.channel.id)) return;

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
}

module.exports = { handleAddCommand };
