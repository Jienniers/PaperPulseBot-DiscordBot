const path = require('path');
const { examinersMap, paperChannels, verifiedCandidates, doubleKeyMaps } = require(
    path.resolve(__dirname, '..', '..', 'data', 'state.js'),
);
const { getVerifiedEmbed } = require(path.resolve(__dirname, '..', '..', 'utils', 'embeds.js'));

async function handleVerify(interaction) {
    const channelID = interaction.channel.id;
    const userOption = interaction.options.getUser('user');
    const key = doubleKeyMaps(userOption.id, channelID);

    if (!paperChannels.includes(channelID)) {
        return await interaction.reply({
            content: '❌ You cannot use this command here.',
            flags: 64,
        });
    }
    if (interaction.user.id !== examinersMap.get(channelID)?.id) {
        return await interaction.reply({
            content: '❌ You are not authorized to verify candidates in this paper session.',
            flags: 64,
        });
    }

    if (examinersMap.get(channelID)?.id === userOption.id) {
        return await interaction.reply({
            content: '❌ You cannot verify an examiner.',
        });
    }

    if (verifiedCandidates.get(key)) {
        return await interaction.reply({
            content: '❌ This candidate is already verified for this session.',
        });
    }

    verifiedCandidates.set(key, true);

    if (verifiedCandidates.get(key)) {
        await interaction.reply({
            content: `${userOption} has been verified. No cheating or unfairness was detected.`,
        });
    }

    const embed = getVerifiedEmbed({
        examiner: interaction.user,
        channel: interaction.channel,
        guild: interaction.guild,
    });

    userOption.send({ embeds: [embed] });
}

module.exports = {
    handleVerify,
};
