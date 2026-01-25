import formatPaperTime from '../../utils/common/time.js';
import { createPaperEmbed } from '../../utils/discord/embeds.js';
import { createPaperButtons } from '../../utils/discord/buttons.js';
import { examinersMap, paperChannels, paperTimeMinsMap } from '../../data/state.js';

// Centralized error messages
const ERROR_MESSAGES = {
    invalidChannel: '❌ You cannot use this command here.',
    missingOptions: '❌ Missing required options. Please provide paper code, examiner, and time.',
    invalidPaperCode: '❌ Please provide paper code in the format `code/variant`, like `0580/12`.',
    examinerBot: '❌ You cannot make examiner a bot.',
    channelCreationFailed:
        '❌ Failed to create paper channel. Check permissions or try again later.',
};

/**
 * Validates the options for starting a paper session.
 * Throws an error object with a key from ERROR_MESSAGES if any check fails.
 */
function validateStartPaper(interaction) {
    const channelId = interaction.channel.id;
    if (paperChannels.includes(channelId)) throw { key: 'invalidChannel' };

    const paperCode = interaction.options.getString('paper')?.trim();
    const examiner = interaction.options.getUser('examiner');
    const paperTime = interaction.options.getInteger('time');

    if (!paperCode || !examiner || !paperTime) throw { key: 'missingOptions' };
    if (!/^\d{4}\/\d{1,2}$/.test(paperCode)) throw { key: 'invalidPaperCode' };
    if (examiner.bot) throw { key: 'examinerBot' };

    return { paperCode, examiner, paperTime };
}

/**
 * Handles starting a new paper session.
 * Flow: validate → create channel → store session data → notify users
 */
export default async function handleStartPaper(interaction) {
    let paperCode, examiner, paperTime;

    try {
        ({ paperCode, examiner, paperTime } = validateStartPaper(interaction));
    } catch (err) {
        const message = ERROR_MESSAGES[err.key] ?? '❌ An unknown error occurred.';
        return interaction.reply({ content: message, flags: 64 });
    }

    await interaction.deferReply({ flags: 64 });

    const guild = interaction.guild;
    const user = interaction.user;
    const categoryID = process.env.CATEGORY_ID;
    const channelName = `${paperCode.split('/')[0]} by ${examiner.username}`;

    let paperChannel;
    try {
        paperChannel = await guild.channels.create({
            name: channelName,
            type: 0, // GuildText
            parent: categoryID,
        });
    } catch (err) {
        console.error('❗ Failed to create paper channel:', err.message);
        return interaction.editReply({ content: ERROR_MESSAGES.channelCreationFailed, flags: 64 });
    }

    // Store session data
    examinersMap.set(paperChannel.id, examiner.id);
    paperTimeMinsMap.set(paperChannel.id, paperTime);
    paperChannels.push(paperChannel.id);

    // Send embed and buttons to new paper channel
    const timeString = formatPaperTime(paperTime);
    const embed = createPaperEmbed(user, paperCode, timeString);
    const buttonsRow = createPaperButtons();

    await paperChannel.send({
        content: `👋 Hello ${user}, starting the paper **${paperCode}**!`,
        embeds: [embed],
        components: [buttonsRow],
    });

    // Confirm to user who ran the command
    await interaction.editReply({
        content: `✅ A new channel has been created for this paper session: <#${paperChannel.id}>`,
        flags: 64,
    });
}
