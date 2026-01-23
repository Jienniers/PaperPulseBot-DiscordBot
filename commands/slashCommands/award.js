import {
    examinersMap,
    paperChannels,
    doubleKeyMaps,
    candidateSessionsMap,
} from '../../data/state.js';

import { getAwardEmbed } from '../../utils/discord/embeds.js';

/**
 * Validates the award interaction.
 * Performs all checks to ensure:
 *  - Command is used in a valid paper channel
 *  - The recipient is not a bot or examiner
 *  - The user issuing the command is authorized
 *  - Marks are in correct `score/total` format
 *  - The paper is actually conducted in the session
 * Updates the candidate's marks in the session.
 * */
function validateAward(interaction) {
    const { channel, user: invokingUser, options } = interaction;
    const channelID = channel.id;
    const userOption = options.getUser('user'); // candidate receiving the marks
    const marksOption = options.getString('marks'); // marks string like "70/100"

    const examiner = examinersMap.get(channelID);

    // Retrieve candidate session data using a composite key
    const key = doubleKeyMaps(userOption.id, channelID);
    const candidateData = candidateSessionsMap.get(key);

    // Validation checks
    if (!paperChannels.includes(channelID)) throw new Error('invalid-channel');
    if (userOption.bot) throw new Error('cannot-award-bot');
    if (invokingUser.id !== examiner) throw new Error('not-authorized');
    if (examiner === userOption.id) throw new Error('cannot-award-examiner');
    if (!/^\d{1,3}\/\d{1,3}$/.test(marksOption)) throw new Error('invalid-format');
    if (!candidateData) throw new Error('no-users-added');

    // Update candidate's marks in candidateSessionsMap map
    candidateData.marks = marksOption;

    return { channelID, userOption, marksOption, examiner };
}

/**
 * Handles the award command.
 * Calls validation, sends confirmation message in channel,
 * creates an award embed, and sends it to the candidate via DM.
 */
export async function handleAward(interaction, client) {
    let data;
    try {
        data = validateAward(interaction);
    } catch (err) {
        // Map error keys from validation to friendly messages
        const messages = {
            'invalid-channel': '❌ You cannot use this command here.',
            'cannot-award-bot': '❌ You cannot award marks to a bot.',
            'not-authorized': '❌ You are not authorized to award marks to candidates.',
            'cannot-award-examiner': '❌ You cannot award marks to an examiner.',
            'invalid-format': '❌ Please provide marks in the format `score/total`, like `70/100`.',
            'no-users-added':
                '❌ There were no users added in this session nor the paper was started.',
        };
        return await interaction.reply({ content: messages[err.message], flags: 64 });
    }

    const { channelID, userOption, marksOption, examiner } = data;

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
