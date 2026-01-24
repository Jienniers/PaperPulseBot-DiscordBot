import {
    examinersMap,
    paperChannels,
    paperTimeMinsMap,
    paperRunningMap,
    candidateSessionsMap,
} from '../../data/state.js';

import { generateAllSessionsEmbed } from './embeds.js';

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
export default {
    close: handleCloseButton,
    view_sessions: handleViewAllSessions,
    // Add more handlers as needed
};
