const path = require('path');
const { examinersMap, paperChannels, verifiedCandidates } = require(
    path.resolve(__dirname, '..', '..', 'data', 'state.js'),
);

async function handleVerify(interaction) {
    const channelID = interaction.channel.id;
    const userOption = interaction.options.getUser("user");

    if (!paperChannels.includes(channelID)) {
        return interaction.reply({
            content: '❌ You cannot use this command here.',
            flags: 64,
        });
    };
    if (interaction.user.id !== examinersMap.get(channelID)?.id) {
        return await interaction.reply({
            content: '❌ You are not authorized to close this paper session.',
            flags: 64,
        });
    }

    const key = `${userOption.id}::${channelID}`;
    verifiedCandidates.set(key, true);
    interaction.reply({
        content: `${userOption} has been verified. No cheating or unfairness was detected.`
    });
}

module.exports = {
    handleVerify
};
