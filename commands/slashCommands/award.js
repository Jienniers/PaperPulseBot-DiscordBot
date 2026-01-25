import {
    examinersMap,
    paperChannels,
    doubleKeyMaps,
    candidateSessionsMap,
} from '../../data/state.js';

import { getAwardEmbed } from '../../utils/discord/embeds.js';

// Centralized error messages
const ERROR_MESSAGES = {
    'invalid-channel': '❌ You cannot use this command here.',
    'cannot-award-bot': '❌ You cannot award marks to a bot.',
    'not-authorized': '❌ You are not authorized to award marks to candidates.',
    'cannot-award-examiner': '❌ You cannot award marks to an examiner.',
    'invalid-format': '❌ Please provide marks in the format `score/total`, like `70/100`.',
    'no-users-added': '❌ There were no users added in this session nor the paper was started.',
};

/**
 * Validates the award interaction.
 * Performs all checks to ensure:
 *  - Command is used in a valid paper channel
 *  - The recipient is not a bot or examiner
 *  - The user issuing the command is authorized
 *  - Marks are in correct `score/total` format
 *  - The paper is actually conducted in the session
 */
function validateAward(interaction) {
    const { channel, user: invokingUser, options } = interaction;
    const channelID = channel.id;
    const userOption = options.getUser('user'); // candidate receiving the marks
    const marksOption = options.getString('marks'); // marks string like "70/100"
    const examiner = examinersMap.get(channelID);

    const key = doubleKeyMaps(userOption.id, channelID);
    const candidateData = candidateSessionsMap.get(key);

    if (!paperChannels.includes(channelID)) throw { key: 'invalid-channel' };
    if (userOption.bot) throw { key: 'cannot-award-bot' };
    if (invokingUser.id !== examiner) throw { key: 'not-authorized' };
    if (examiner === userOption.id) throw { key: 'cannot-award-examiner' };
    if (!/^\d{1,3}\/\d{1,3}$/.test(marksOption)) throw { key: 'invalid-format' };
    if (!candidateData) throw { key: 'no-users-added' };

    return { channelID, userOption, marksOption, examiner, candidateData };
}

/**
 * Handles the award command.
 * Flow: validate → update marks → send confirmation → create embed → send DM
 */
export default async function handleAward(interaction, client) {
    let data;
    try {
        data = validateAward(interaction);
    } catch (err) {
        const message = ERROR_MESSAGES[err.key] ?? '❌ An unknown error occurred.';
        return await interaction.reply({ content: message, flags: 64 });
    }

    const { channelID, userOption, marksOption, examiner, candidateData } = data;

    // Update candidate's marks in (candidateSessionsMap) map
    candidateData.marks = marksOption;

    // Send confirmation in the channel
    await interaction.reply({
        content: `${userOption} has been awarded ${marksOption} marks.`,
    });

    // Create the award embed to send to the candidate
    const embed = getAwardEmbed({
        candidate: userOption,
        examiner: client.users.cache.get(examiner),
        marks: marksOption,
        guildId: interaction.guild.id,
        channelId: channelID,
    });

    // Attempt to send the DM; catch errors if user has DMs closed
    try {
        await userOption.send({ embeds: [embed] });
    } catch (err) {
        console.warn(`❗ Failed to send DM to user ${userOption.id}:`, err.message);
    }
}
