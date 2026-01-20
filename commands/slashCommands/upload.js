import { examinersMap, paperChannels } from '../../data/state.js';
import { sendExaminerSubmissionEmbed } from '../../utils/discord/embeds.js';


export async function handleUpload(interaction) {
    const channelId = interaction.channel.id;
    if (!paperChannels.includes(channelId)) {
        return interaction.reply({
            content: '❌ You cannot use this command here.',
            flags: 64,
        });
    }
    await interaction.deferReply({ flags: 64 });

    const attachment = interaction.options.getAttachment('file');

    if (!attachment) {
        return interaction.editReply({
            content: '❌ No file was uploaded. Please attach a PDF file.',
        });
    }

    // Strict and safe PDF check
    const isPDF =
        attachment?.contentType?.toLowerCase() === 'application/pdf' ||
        attachment?.name?.toLowerCase().endsWith('.pdf');

    if (!isPDF) {
        return interaction.editReply({
            content: '❌ Only PDF files are allowed. Please upload a `.pdf` file.',
        });
    }

    const maxSizeMB = 10;
    if (attachment.size > maxSizeMB * 1024 * 1024) {
        return interaction.editReply({
            content: `❌ File size exceeds the ${maxSizeMB}MB limit.`,
        });
    }

    await interaction.editReply({
        content: `✅ Received your PDF file: **${attachment.name}**`,
    });

    const examiner = examinersMap.get(channelId);

    if (examiner) {
        try {
            await examiner.send({
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
            });
        } catch (err) {
            console.warn(`❗ Failed to send DM to examiner ${examiner}:`, err.message);

            await interaction.followUp({
                content: '⚠️ Examiner could not receive your file (DMs might be disabled).',
                ephemeral: true,
            });
        }
    }
}