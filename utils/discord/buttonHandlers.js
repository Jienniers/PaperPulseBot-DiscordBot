const path = require('path');

const {
    examinersMap,
    paperChannels,
    paperTimeMinsMap,
    paperRunningMap,
    candidateSessionsMap,
} = require('../../data/state.js');

const { generateAllSessionsEmbed } = require('./embeds');

async function handleDoneButton(interaction, channelID) {
    if (interaction.user.id === examinersMap.get(channelID)) {
        await interaction.reply({ content: "You are the examiner; you can't submit a paper!", flags: 64 });
        return;
    }

    await interaction.reply({
        content: 'Please stop writing and put your pen down.',
        flags: 64,
    });
    await interaction.channel.send(`${interaction.user} completed the paper!`);
}

async function handleCloseButton(interaction, channelID) {
    if (interaction.user.id !== examinersMap.get(channelID)) {
        await interaction.reply({ content: '❌ Not authorized.', flags: 64 });
        return;
    }

    // remove all in-memory state for this channel
    const index = paperChannels.indexOf(channelID);
    if (index > -1) paperChannels.splice(index, 1);
    paperTimeMinsMap.delete(channelID);
    paperRunningMap.delete(channelID);
    examinersMap.delete(channelID);

    try {
        await interaction.channel.delete();
    } catch (err) {
        console.error('Failed to delete channel:', err);
        await interaction.reply({ content: '❌ Failed to delete channel.', flags: 64 });
    }
}

// eslint-disable-next-line no-unused-vars
async function handleViewAllSessions(interaction, channelID) {
    const sessions = [];
    const user = interaction.user;

    for (const [key, session] of candidateSessionsMap.entries()) {
        // eslint-disable-next-line no-unused-vars
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
