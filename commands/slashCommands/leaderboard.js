import { getLeaderboardEmbed } from '../../utils/discord/embeds.js';
import { candidateSessionsMap } from '../../data/state.js';

/**
 * Handles the leaderboard command.
 * Collects all candidate session data in the current channel,
 * calculates total scored marks for each user, sorts them by percentage,
 * and sends a leaderboard embed as a reply.
 */
export default async function handleLeaderboard(interaction) {
    const { channel, client } = interaction;
    const channelId = channel.id;

    // Defer reply in case processing takes a moment
    await interaction.deferReply();

    // Get all candidate sessions
    const allEntries = [...candidateSessionsMap.values()];

    // Filter entries that are valid for this channel and have proper marks
    const validEntries = allEntries.filter((entry) => {
        return (
            entry.verified && // Candidate session is verified
            typeof entry.marks === 'string' && // Marks exist as a string
            /^\d+\/\d+$/.test(entry.marks) && // Matches "score/total" format
            entry.channelId === channelId // Only consider current channel
        );
    });

    // Map to accumulate total scored and total possible marks per user
    const totals = new Map();

    for (const entry of validEntries) {
        // Split marks into scored and total and convert it to Number
        const [scored, total] = entry.marks.split('/').map(Number);
        if (isNaN(scored) || isNaN(total)) continue; // Skip invalid marks

        // Fetch user from Discord
        const user = await client.users.fetch(entry.userId);

        // Get previous totals or initialize
        const prev = totals.get(user.id) || { username: user.username, scored: 0, total: 0 };

        // Update totals
        totals.set(user.id, {
            username: user.username,
            scored: prev.scored + scored,
            total: prev.total + total,
        });
    }

    // Convert totals map to array (of the map values) and sort by percentage (highest first)
    const leaderboardData = [...totals.values()].sort(
        (a, b) => b.scored / b.total - a.scored / a.total,
    );

    // Generate leaderboard embed
    const embed = getLeaderboardEmbed(leaderboardData);

    // Send the leaderboard as a reply
    await interaction.editReply({ embeds: [embed] });
}
