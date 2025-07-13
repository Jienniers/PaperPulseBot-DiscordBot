const path = require('path');

const {
    examinersMap,
    paperChannels,
    paperTimeMinsMap,
    paperRunningMap,
    candidateSessionsMap,
} = require(path.resolve(__dirname, '..', 'data', 'state.js'));

const { generateAllSessionsEmbed } = require(path.resolve(__dirname, 'embeds.js'));

async function handleDoneButton(interaction, channelID) {
    if (interaction.user.id === examinersMap.get(channelID)?.id) return;

    await interaction.reply({
        content: 'Please stop writing and put your pen down.',
        flags: 64,
    });
    await interaction.channel.send(`${interaction.user} completed the paper!`);
}

async function handleCloseButton(interaction, channelID) {
    if (interaction.user.id !== examinersMap.get(channelID)?.id) {
        await interaction.reply({
            content: '❌ You are not authorized to close this paper session.',
            flags: 64,
        });
        return;
    }

    //clearing up all the maps and array after you delete the channel in this button function

    const index = paperChannels.indexOf(channelID);
    if (index > -1) paperChannels.splice(index, 1);

    paperTimeMinsMap.delete(channelID);
    paperRunningMap.delete(channelID);
    examinersMap.delete(channelID);
    for (const key of candidateSessionsMap.keys()) {
        if (key.includes(channelID)) {
            candidateSessionsMap.delete(key);
        }
    }

    interaction.channel.delete();
}

async function handleViewAllSessions(interaction, _channelID) {
    const sessions = [];
    const user = interaction.user;

    for (const [key, session] of candidateSessionsMap.entries()) {
        const [candidateId, _sessionId] = key.split('::');
        if (candidateId === user.id) {
            sessions.push(session);
        }
    }

    const embed = generateAllSessionsEmbed(sessions, user);
    await interaction.reply({ embeds: [embed], flags: 64 });
}

// 🔧 Maps button IDs to their corresponding handler functions
const buttonHandlers = {
    done: handleDoneButton,
    close: handleCloseButton,
    view_sessions: handleViewAllSessions,
    // Add more handlers as needed
};

module.exports = { buttonHandlers };
