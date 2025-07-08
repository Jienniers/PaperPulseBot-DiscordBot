const path = require('path');
const { examinersMap, paperChannels } = require(path.resolve(__dirname, '..', 'data', 'state.js'));
const { sendExaminerSubmissionEmbed } = require(path.resolve(__dirname, '..', 'utils', 'embeds.js'));

async function handleUpload(interaction) {
    const channelId = interaction.channel.id;
    if (!paperChannels.includes(channelId)) {
        return interaction.reply({
            content: '❌ You cannot use this command here.',
            flags: 64
        });
    }
    await interaction.deferReply({ flags: 64 });

    const attachment = interaction.options.getAttachment('file');

    // Strict and safe PDF check
    const isPDF =
        attachment?.contentType?.toLowerCase() === 'application/pdf' ||
        attachment?.name?.toLowerCase().endsWith('.pdf');

    if (!isPDF) {
        return interaction.editReply({
            content: '❌ Only PDF files are allowed. Please upload a `.pdf` file.',
            flags: 64
        });
    }

    await interaction.editReply({
        content: `✅ Received your PDF file: **${attachment.name}**`,
        flags: 64
    });

    const examiner = examinersMap.get(channelId);
    if (examiner) {
        await examiner.send({
            content: '📩 A new paper submission has been received.',
            embeds: [sendExaminerSubmissionEmbed(channelId, interaction.user, attachment, interaction.guild)],
            files: [attachment]
        });
    }
}

module.exports = {
    handleUpload
};
