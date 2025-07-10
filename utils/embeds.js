const { EmbedBuilder } = require('discord.js');

// Returns the embed shown in the paper channel when a paper is started with /startpaper
function createPaperEmbed(user, paperCode, timeString) {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('📝 Paper Started, Good Luck!')
        .setDescription(
            `👨‍🏫 Started by: ${user}\n📄 Paper Code: ${paperCode}\n⏱️ Duration: ${timeString}`,
        )
        .setTimestamp();
}

function sendExaminerSubmissionEmbed(channelId, candidate, attachment, guild) {
    const embed = new EmbedBuilder()
        .setTitle('📄 New Paper Submission')
        .setDescription(`A candidate has submitted their solved paper for review.`)
        .addFields(
            { name: '🆔 Session Channel ID', value: `\`${channelId}\``, inline: true },
            { name: '🆔 Session Server ID', value: `\`${guild.id}\``, inline: true },
            {
                name: '🔗 Session Channel Link',
                value: `[Click to view channel](https://discord.com/channels/${guild.id}/${channelId})`,
                inline: false,
            },
            { name: '👤 Candidate', value: `${candidate.tag}`, inline: true },
            { name: '📎 File Name', value: attachment.name, inline: false },
        )

        .setColor(0x2f3136)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/337/337946.png')
        .setFooter({ text: 'PaperPulse Bot • Examiner Dashboard' })
        .setTimestamp();

    return embed;
}

function getVerifiedEmbed({ examiner, channel, guild }) {
    return new EmbedBuilder()
        .setColor(0x4ade80) // Green color
        .setTitle('✅ Candidate Verified')
        .setDescription(`You have been verified by **${examiner.tag}** for the paper session.`)
        .addFields(
            {
                name: '🧑‍🏫 Examiner',
                value: `${examiner.tag}`,
                inline: true,
            },
            {
                name: '🗂️ Session ID (Channel)',
                value: `[${channel.name}](https://discord.com/channels/${guild.id}/${channel.id})`,
                inline: true,
            },
            {
                name: '🧾 Server ID',
                value: `${guild.id}`,
                inline: true,
            },
            {
                name: '🧾 Paper Channel ID',
                value: `${channel.id}`,
                inline: false,
            },
        )
        .setFooter({ text: 'PaperPulseBot • Verification Complete' })
        .setTimestamp();
}

function getAwardEmbed({ candidate, examiner, marks, guildId, channelId }) {
    return new EmbedBuilder()
        .setTitle('🏅 You Have Been Awarded Marks!')
        .setDescription(`Your performance has been evaluated.`)
        .setColor(0x4caf50)
        .addFields(
            { name: '👤 Candidate', value: `<@${candidate.id}>`, inline: true },
            { name: '🧑‍🏫 Examiner', value: `${examiner.tag}`, inline: true },
            { name: '📊 Marks Awarded', value: `**${marks}**`, inline: true },
            { name: '🗂️ Session ID', value: `\`${channelId}\`` },
            { name: '🌐 Server ID', value: `\`${guildId}\`` },
            {
                name: '🔗 Paper Channel',
                value: `[Jump to session](https://discord.com/channels/${guildId}/${channelId})`,
            },
        )
        .setFooter({ text: 'PaperPulse • Marks Award System' })
        .setTimestamp();
}

module.exports = {
    createPaperEmbed,
    sendExaminerSubmissionEmbed,
    getVerifiedEmbed,
    getAwardEmbed,
};
