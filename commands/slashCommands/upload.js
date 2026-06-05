import { state } from '../../data/state.js';
import { sendExaminerSubmissionEmbed } from '../../utils/discord/embeds.js';

const MAX_PDF_SIZE_MB = 10; // Maximum allowed PDF size in MB

const ERROR_MESSAGES = {
    invalidChannel: '❌ You cannot use this command here.',
    noFile: '❌ No file was uploaded. Please attach a PDF file.',
    invalidFormat: '❌ Only PDF files are allowed. Please upload a `.pdf` file.',
    fileTooLarge: `❌ File size exceeds the ${MAX_PDF_SIZE_MB}MB limit.`,
};

/**
 * Validates the uploaded file.
 * Throws an error object with a key from ERROR_MESSAGES if any check fails.
 */
function validateUpload(interaction) {
    const channelID = interaction.channel.id;
    const uploadedFile = interaction.options.getAttachment('file');
    const currentChannel = state.guilds?.[interaction.guild.id]?.sessions?.[channelID];

    if (!currentChannel) throw { key: 'invalidChannel' };
    if (!uploadedFile) throw { key: 'noFile' };

    const isPDF =
        uploadedFile?.contentType?.toLowerCase() === 'application/pdf' ||
        uploadedFile?.name?.toLowerCase().endsWith('.pdf');

    if (!isPDF) throw { key: 'invalidFormat' };
    if (uploadedFile.size > MAX_PDF_SIZE_MB * 1024 * 1024) throw { key: 'fileTooLarge' };

    return uploadedFile;
}

/**
 * Handles paper submission uploads.
 * Flow: defer → validate → confirm → notify examiner.
 */
export default async function handleUpload(interaction) {
    const channelID = interaction.channel.id;

    await interaction.deferReply({ flags: 64 });

    let attachment;
    try {
        attachment = validateUpload(interaction);
    } catch (err) {
        const message = ERROR_MESSAGES[err.key] ?? '❌ An unknown error occurred.';
        return interaction.editReply({ content: message });
    }

    await interaction.editReply({
        content: `✅ Received your PDF file: **${attachment.name}**`,
    });

    const examinerId = state.guilds[interaction.guild.id].sessions[channelID].examinerId;
    if (!examinerId) return;

    const examinerUser = await interaction.client.users.fetch(examinerId);

    if (examinerUser) {
        try {
            await examinerUser.send({
                content: '📩 A new paper submission has been received.',
                embeds: [
                    sendExaminerSubmissionEmbed(
                        channelID,
                        interaction.user,
                        attachment,
                        interaction.guild,
                    ),
                ],
                files: [attachment],
            });
        } catch (err) {
            console.error('[upload] Failed to send submission DM to examiner', {
                examinerId: examinerUser.id,
                candidateId: interaction.user.id,
                channelID,
                errorMessage: err.message,
                timestamp: new Date().toISOString(),
            });

            await interaction.followUp({
                content: '⚠️ Examiner could not receive your file (DMs might be disabled).',
                ephemeral: true,
            });
        }
    }
}
