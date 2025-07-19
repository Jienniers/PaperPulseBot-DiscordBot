const path = require('path');
const { getLeaderboardEmbed } = require(path.resolve(__dirname, '..', '..', 'utils', 'embeds.js'));
const { candidateSessionsMap } = require(path.resolve(__dirname, '..', '..', 'data', 'state.js'));

async function handleLeaderboard(interaction) {
    await interaction.deferReply();

    const allEntries = [...candidateSessionsMap.values()];

    const validEntries = allEntries.filter((entry) => {
        return (
            entry.verified &&
            typeof entry.marks === 'string' &&
            /^\d+\/\d+$/.test(entry.marks)
        );
    });

    const totals = new Map();

    for (const entry of validEntries) {
        const [scored, total] = entry.marks.split('/').map(Number);
        if (isNaN(scored) || isNaN(total)) continue;

        const user = await interaction.client.users.fetch(entry.userId);
        const prev = totals.get(user.id) || { username: user.username, scored: 0, total: 0 };

        totals.set(user.id, {
            username: user.username,
            scored: prev.scored + scored,
            total: prev.total + total,
        });
    }

    const leaderboardData = [...totals.values()]
        .sort((a, b) => (b.scored / b.total) - (a.scored / a.total));

    const embed = getLeaderboardEmbed(leaderboardData);

    await interaction.editReply({ embeds: [embed] });
}

module.exports = {
    handleLeaderboard,
};
