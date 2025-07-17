const path = require('path');
const {
    examinersMap,
    paperChannels,
    doubleKeyMaps,
    candidateSessionsMap,
} = require(path.resolve(__dirname, '..', '..', 'data', 'state.js'));
const { getVerifiedEmbed } = require(path.resolve(__dirname, '..', '..', 'utils', 'embeds.js'));

async function handleVerify(interaction) {
    const channel = interaction.channel;
    const channelID = channel.id;
    const guild = interaction.guild;
    const examiner = interaction.user;
    const userOption = interaction.options.getUser('user');

    // Validation: Ensure this command is used in a paper channel
    if (!paperChannels.includes(channelID)) {
        return await interaction.reply({
            content: '❌ You cannot use this command here.',
            flags: 64,
        });
    }

    // Validation: Check if user was provided
    if (!userOption) {
        return await interaction.reply({
            content: '❌ No user was mentioned for verification.',
            flags: 64,
        });
    }

    // Validation: Prevent verifying bots
    if (userOption.bot) {
        return await interaction.reply({
            content: '❌ You cannot verify a bot.',
            flags: 64,
        });
    }

    // Pre-derive frequently reused data
    const examinerInMap = examinersMap.get(channelID);
    const userId = userOption.id;
    const examinerId = examinerInMap?.id;

    // Validation: Prevent self-verification
    if (examinerId === userId) {
        return await interaction.reply({
            content: '❌ You cannot verify an examiner.',
            flags: 64,
        });
    }

    // Validation: Ensure only assigned examiner can verify
    if (examiner.id !== examinerId) {
        return await interaction.reply({
            content: '❌ You are not authorized to verify candidates in this paper session.',
            flags: 64,
        });
    }

    const key = doubleKeyMaps(userId, channelID);
    const candidateData = candidateSessionsMap.get(key);

    // Validation: User must be an added candidate
    if (!candidateData) {
        return await interaction.reply({
            content: '❌ This user was not added as a candidate, or the paper session hasn’t started yet.',
            flags: 64,
        });
    }

    // Validation: Prevent re-verifying an already verified user
    if (candidateData.verified) {
        return await interaction.reply({
            content: '❌ This candidate is already verified for this session.',
            flags: 64,
        });
    }

    // ✅ Proceed to verification
    candidateData.verified = true;

    await interaction.reply({
        content: `${userOption} has been verified. No cheating or unfairness was detected.`,
        flags: 64,
    });

    const embed = getVerifiedEmbed({
        examiner,
        channel,
        guild,
    });

    try {
        await userOption.send({ embeds: [embed] });
    } catch (err) {
        console.warn(`❗ Could not DM candidate ${userId}: ${err.message}`);
    }
}

module.exports = {
    handleVerify,
};
