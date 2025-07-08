const { EmbedBuilder } = require('discord.js');

// Returns the embed shown in the paper channel when a paper is started with /startpaper
function createPaperEmbed(user, paperCode, timeString) {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("📝 Paper Started, Good Luck!")
        .setDescription(`👨‍🏫 Started by: ${user}\n📄 Paper Code: ${paperCode}\n⏱️ Duration: ${timeString}`)
        .setTimestamp();
}

function sendExaminerSubmissionEmbed(channelId, candidate, attachment, guild) {
    const embed = new EmbedBuilder()
        .setTitle('📄 New Paper Submission')
        .setDescription(`A candidate has submitted their solved paper for review.`)
        .addFields(
            { name: '🆔 Session Channel ID', value: `\`${channelId}\``, inline: true },
            { name: '🆔 Session Server ID', value: `\`${guild.id}\``, inline: true },
            { name: '🔗 Session Channel Link', value: `[Click to view channel](https://discord.com/channels/${guild.id}/${channelId})`, inline: false },
            { name: '👤 Candidate', value: `${candidate.tag}`, inline: true },
            { name: '📎 File Name', value: attachment.name, inline: false }
        )


        .setColor(0x2F3136)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/337/337946.png')
        .setFooter({ text: 'PaperPulse Bot • Examiner Dashboard' })
        .setTimestamp();

    return embed;
}

module.exports = {
    createPaperEmbed,
    sendExaminerSubmissionEmbed
};
