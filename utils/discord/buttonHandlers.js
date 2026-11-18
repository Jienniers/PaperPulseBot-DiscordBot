import { paperTimerIntervals } from '../../commands/messageCommands/add.js';
import { getGuildData, getSession, unsetGuildField } from '../database/guildData.js';
import { generateAllSessionsEmbed } from './embeds.js';

async function handleCloseButton(interaction, channelID) {
    const guildId = interaction.guildId;

    const session = await getSession(guildId, channelID);

    if (!session) {
        console.log('Session not found', interaction.guildId, channelID);
        return interaction.reply({
            content: '❌ Session not found.',
            flags: 64,
        });
    }

    // authorization check
    if (interaction.user.id !== session.examinerId) {
        return interaction.reply({
            content: '❌ Not authorized.',
            flags: 64,
        });
    }

    try {
        await interaction.channel.delete();
    } catch (err) {
        console.error('Failed to delete channel:', err);

        return interaction.reply({
            content: '❌ Failed to delete channel.',
            flags: 64,
        });
    }

    await unsetGuildField(guildId, `sessions.${channelID}`);

    // Clear the paper timer interval if it exists
    if (paperTimerIntervals.has(channelID)) {
        clearInterval(paperTimerIntervals.get(channelID));
        paperTimerIntervals.delete(channelID);
    }
}

async function handleViewAllSessions(interaction, channelID, targetUserId) {
    const guildId = interaction.guildId;
    const userId = targetUserId ?? interaction.user.id;

    const guild = await getGuildData(guildId);
    if (!guild?.sessions) {
        return interaction.reply({
            content: 'No sessions found.',
            flags: 64,
        });
    }

    const sessions = [];

    for (const [sessionChannelID, session] of Object.entries(guild.sessions)) {
        const candidate = session.candidates?.[userId];

        if (candidate) {
            sessions.push({
                ...session,
                channelID: sessionChannelID,
                candidateData: candidate,
            });
        }
    }

    let profileUser = interaction.user;
    if (userId !== interaction.user.id) {
        try {
            profileUser = await interaction.client.users.fetch(userId);
        } catch {
            profileUser = { id: userId, username: 'Unknown' };
        }
    }

    const embed = generateAllSessionsEmbed(sessions, profileUser);

    await interaction.reply({
        embeds: [embed],
        flags: 64,
    });
}

// 🔧 Button handlers
export default {
    close: handleCloseButton,
    view_sessions: handleViewAllSessions,
};
