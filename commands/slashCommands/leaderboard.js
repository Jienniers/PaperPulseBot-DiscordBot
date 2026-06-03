import { state } from '../../data/state.js';
import { getLeaderboardEmbed } from '../../utils/discord/embeds.js';

/**
 * Handles the leaderboard command.
 */
export default async function handleLeaderboard(interaction) {
    const { client, guildId, channelID } = interaction;

    await interaction.deferReply();

    const session = state.guilds?.[guildId]?.sessions?.[channelID];

    if (!session || !session.candidates) {
        return interaction.editReply({
            content: 'No session data found for this channel.',
        });
    }

    const totals = new Map();

    for (const [userId, data] of Object.entries(session.candidates)) {
        if (!data?.marks || typeof data.marks !== 'string') continue;
        if (!/^\d+\/\d+$/.test(data.marks)) continue;

        const [scored, total] = data.marks.split('/').map(Number);
        if (isNaN(scored) || isNaN(total) || total === 0) continue;

        let user;
        try {
            user = await client.users.fetch(userId);
        } catch {
            continue;
        }

        const prev = totals.get(userId) || {
            username: user.username,
            scored: 0,
            total: 0,
        };

        totals.set(userId, {
            username: user.username,
            scored: prev.scored + scored,
            total: prev.total + total,
        });
    }

    const leaderboardData = [...totals.values()].sort(
        (a, b) => b.scored / b.total - a.scored / a.total,
    );

    const embed = getLeaderboardEmbed(leaderboardData);

    await interaction.editReply({ embeds: [embed] });
}
