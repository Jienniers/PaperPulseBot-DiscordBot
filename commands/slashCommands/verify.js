const path = require('path');
const { examinersMap, paperChannels, doubleKeyMaps, candidateSessionsMap } = require(
    path.resolve(__dirname, '..', '..', 'data', 'state.js'),
);

const { getVerifiedEmbed } = require(
    path.resolve(__dirname, '..', '..', 'utils', 'discord', 'embeds.js'),
);

async function handleVerify(interaction) {
    const channel = interaction.channel;
    const guild = interaction.guild;
    const examiner = interaction.user;
    const channelId = channel.id;
    const userOption = interaction.options.getUser('user');

    if (!paperChannels.includes(channelId)) {
        return interaction.reply({
            content: '❌ You cannot use this command here.',
            flags: 64,
        });
    }

    if (!userOption) {
        return interaction.reply({
            content: '❌ No user was mentioned for verification.',
            flags: 64,
        });
    }

    if (userOption.bot) {
        return interaction.reply({
            content: '❌ You cannot verify a bot.',
            flags: 64,
        });
    }

    const assignedExaminerID = examinersMap.get(channelId);
    const userId = userOption.id;

    if (!assignedExaminerID || assignedExaminerID !== examiner.id) {
        return interaction.reply({
            content: '❌ You are not authorized to verify candidates in this paper session.',
            flags: 64,
        });
    }

    if (userId === examiner.id) {
        return interaction.reply({
            content: '❌ You cannot verify yourself.',
            flags: 64,
        });
    }

    const key = doubleKeyMaps(userId, channelId);
    const candidateData = candidateSessionsMap.get(key);

    if (!candidateData) {
        return interaction.reply({
            content:
                '❌ This user was not added as a candidate, or the paper session hasn’t started yet.',
            flags: 64,
        });
    }

    if (candidateData.verified) {
        return interaction.reply({
            content: '❌ This candidate is already verified for this session.',
            flags: 64,
        });
    }

    candidateData.verified = true;

    await interaction.reply({
        content: `✅ ${userOption} has been verified. No cheating or unfairness was detected.`,
        flags: 64,
    });

    const embed = getVerifiedEmbed({
        examiner: examiner,
        channel: channel,
        guild: guild,
    });

    try {
        await userOption.send({ embeds: [embed] });
    } catch (err) {
        console.warn(`❗ Could not DM candidate ${userId}: ${err.message}`);

        await interaction.followUp({
            content: '⚠️ Candidate could not be notified via DM (possibly disabled).',
            ephemeral: true,
        });
    }
}

module.exports = {
    handleVerify,
};
