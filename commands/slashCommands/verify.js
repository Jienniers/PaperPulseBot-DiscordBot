import { getSession, verifyCandidate } from '../../utils/database/guildData.js';
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
async function validateVerification(interaction) {
    const { channel, user: examiner, options } = interaction;
    const channelID = channel.id;
    const userOption = options.getUser('user');
    const guildId = interaction.guildId;

    const currentChannel = await getSession(guildId, channelID);

    if (!currentChannel) throw { key: 'invalidChannel' };
    if (!userOption) throw { key: 'noUser' };
    if (userOption.bot) throw { key: 'botUser' };

    const assignedExaminerID = currentChannel.examinerId;
    if (!assignedExaminerID || assignedExaminerID !== examiner.id) throw { key: 'notAuthorized' };

    if (userOption.id === examiner.id) throw { key: 'selfVerify' };

    const candidateData = currentChannel.candidates?.[userOption.id];
    if (!candidateData) throw { key: 'noCandidate' };
    if (candidateData.verified) throw { key: 'alreadyVerified' };

    return { userOption, candidateData };
}

/**
 * Handles the verify command.
 * Focused on flow: call validation, mark verified, send messages.
 */
export default async function handleVerify(interaction) {
    let userOption;

    try {
        ({ userOption } = await validateVerification(interaction));
    } catch (err) {
        const message = ERROR_MESSAGES[err.key] ?? '❌ An unknown error occurred.';
        return interaction.reply({ content: message, flags: 64 });
    }

    // Mark candidate as verified
    const verified = await verifyCandidate(
        interaction.guildId,
        interaction.channel.id,
        userOption.id,
    );
    if (!verified) {
        return interaction.reply({ content: ERROR_MESSAGES.alreadyVerified, flags: 64 });
    }

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
        console.error('[verify] Failed to send verification DM', {
            userId: userOption.id,
            channelID: interaction.channel.id,
            errorCode: err.code,
            errorMessage: err.message,
            timestamp: new Date().toISOString(),
        });
        await interaction.followUp({
            content: '⚠️ Candidate could not be notified via DM (possibly disabled).',
            ephemeral: true,
        });
    }
}
