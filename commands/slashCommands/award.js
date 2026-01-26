import {
    examinersMap,
    paperChannels,
    candidateSessionsMap,
    COMPOSITE_KEY_SEPARATOR,
} from '../../data/state.js';

import { getAwardEmbed } from '../../utils/discord/embeds.js';

const ERROR_MESSAGES = {
    invalidChannel: '❌ You cannot use this command here.',
    cannotAwardBot: '❌ You cannot award marks to a bot.',
    notAuthorized: '❌ You are not authorized to award marks to candidates.',
    cannotAwardExaminer: '❌ You cannot award marks to an examiner.',
    invalidFormat: '❌ Please provide marks in the format `score/total`, like `70/100`.',
    noUsersAdded: '❌ There were no users added in this session nor the paper was started.',
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

    const key = `${userOption.id}${COMPOSITE_KEY_SEPARATOR}${channelID}`;
    const candidateData = candidateSessionsMap.get(key);

    if (!paperChannels.includes(channelID)) throw { key: 'invalidChannel' };
    if (userOption.bot) throw { key: 'cannotAwardBot' };
    if (invokingUser.id !== examiner) throw { key: 'notAuthorized' };
    if (examiner === userOption.id) throw { key: 'cannotAwardExaminer' };
    if (!/^\d{1,3}\/\d{1,3}$/.test(marksOption)) throw { key: 'invalidFormat' };
    if (!candidateData) throw { key: 'noUsersAdded' };

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

    await interaction.reply({
        content: `${userOption} has been awarded ${marksOption} marks.`,
    });

    const embed = getAwardEmbed({
        candidate: userOption,
        examiner: client.users.cache.get(examiner),
        marks: marksOption,
        guildId: interaction.guild.id,
        channelId: channelID,
    });

    try {
        await userOption.send({ embeds: [embed] });
    } catch (err) {
        console.error('[award] Failed to send marks notification DM', {
            candidateId: userOption.id,
            examinerId: examiner,
            channelId: channelID,
            marks: marksOption,
            errorCode: err.code,
            errorMessage: err.message,
            timestamp: new Date().toISOString(),
        });
    }
}
