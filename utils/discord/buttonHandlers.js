import { state } from '../../data/state.js';
import { generateAllSessionsEmbed } from './embeds.js';

async function handleCloseButton(interaction, channelID) {
    const guildId = interaction.guildId;

    const session = state.guilds?.[guildId]?.sessions?.[channelID];

    if (!session) {
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

    // remove session from memory
    delete state.guilds[guildId].sessions[channelID];

    try {
        await interaction.channel.delete();
    } catch (err) {
        console.error('Failed to delete channel:', err);

        return interaction.reply({
            content: '❌ Failed to delete channel.',
            flags: 64,
        });
    }
}

async function handleViewAllSessions(interaction, channelID, targetUserId) {
    const guildId = interaction.guildId;
    const userId = targetUserId ?? interaction.user.id;

    const guild = state.guilds?.[guildId];
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
