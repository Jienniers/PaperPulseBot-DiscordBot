import {
    examinersMap,
    paperChannels,
    generateCompositeKey,
    candidateSessionsMap,
} from '../../data/state.js';

import { getVerifiedEmbed } from '../../utils/discord/embeds.js';

const ERROR_MESSAGES = {
    invalidChannel: '❌ You cannot use this command here.',
    noUser: '❌ No user was mentioned for verification.',
    botUser: '❌ You cannot verify a bot.',
    notAuthorized: '❌ You are not authorized to verify candidates in this paper session.',
    selfVerify: '❌ You cannot verify yourself.',
    noCandidate:
        '❌ This user was not added as a candidate, or the paper session hasn’t started yet.',
    alreadyVerified: '❌ This candidate is already verified for this session.',
};

/**
 * Validates the verification attempt.
 * Throws an error object with a key from ERROR_MESSAGES if any check fails.
 */
function validateVerification(interaction) {
    const { channel, user: examiner, options } = interaction;
    const channelId = channel.id;
    const userOption = options.getUser('user');

    if (!paperChannels.includes(channelId)) throw { key: 'invalidChannel' };
    if (!userOption) throw { key: 'noUser' };
    if (userOption.bot) throw { key: 'botUser' };

    const assignedExaminerID = examinersMap.get(channelId);
    if (!assignedExaminerID || assignedExaminerID !== examiner.id) throw { key: 'notAuthorized' };

    if (userOption.id === examiner.id) throw { key: 'selfVerify' };

    const key = generateCompositeKey(userOption.id, channelId);
    const candidateData = candidateSessionsMap.get(key);
    if (!candidateData) throw { key: 'noCandidate' };
    if (candidateData.verified) throw { key: 'alreadyVerified' };

    return { userOption, candidateData };
}

/**
 * Handles the verify command.
 * Focused on flow: call validation, mark verified, send messages.
 */
export default async function handleVerify(interaction) {
    let userOption, candidateData;

    try {
        ({ userOption, candidateData } = validateVerification(interaction));
    } catch (err) {
        const message = ERROR_MESSAGES[err.key] ?? '❌ An unknown error occurred.';
        return interaction.reply({ content: message, flags: 64 });
    }

    // Mark candidate as verified
    candidateData.verified = true;

    await interaction.reply({
        content: `✅ ${userOption} has been verified. No cheating or unfairness was detected.`,
        flags: 64,
    });

    const embed = getVerifiedEmbed({
        examiner: interaction.user,
        channel: interaction.channel,
        guild: interaction.guild,
    });

    try {
        await userOption.send({ embeds: [embed] });
    } catch (err) {
        console.warn(`❗ Could not DM candidate ${userOption.id}: ${err.message}`);
        await interaction.followUp({
            content: '⚠️ Candidate could not be notified via DM (possibly disabled).',
            ephemeral: true,
        });
    }
}
