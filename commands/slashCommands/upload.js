import { examinersMap, paperChannels } from '../../data/state.js';
import { sendExaminerSubmissionEmbed } from '../../utils/discord/embeds.js';

const MAX_PDF_SIZE_MB = 10; // Maximum allowed PDF size in MB
const DM_TIMEOUT_MS = 10000; // 10 second timeout for DM sends

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
    const channelId = interaction.channel.id;
    const uploadedFile = interaction.options.getAttachment('file');
p
    if (!paperChannels.includes(channelId)) throw { key: 'invalidChannel' };
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
    const channelId = interaction.channel.id;

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

    const examinerId = examinersMap.get(channelId);
    if (!examinerId) return;

    const examinerUser = await interaction.client.users.fetch(examinerId);

    if (examinerUser) {
        try {
            await Promise.race([
                examinerUser.send({
                    content: '📩 A new paper submission has been received.',
                    embeds: [
                        sendExaminerSubmissionEmbed(
                            channelId,
                            interaction.user,
                            attachment,
                            interaction.guild,
                        ),
                    ],
                    files: [attachment],
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('DM send timeout')), DM_TIMEOUT_MS),
                ),
            ]);
        } catch (err) {
            console.warn(`❗ Failed to send DM to examiner ${examinerUser.id}:`, err.message);

            await interaction.followUp({
                content: '⚠️ Examiner could not receive your file (DMs might be disabled).',
                ephemeral: true,
            });
        }
    }
}
