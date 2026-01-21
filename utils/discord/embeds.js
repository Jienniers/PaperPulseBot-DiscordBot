import { EmbedBuilder } from 'discord.js';

// Returns the embed shown in the paper channel when a paper is started with /startpaper
export function createPaperEmbed(user, paperCode, timeString) {
    return new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📝 Paper Started, Good Luck!')
        .setDescription(
            `👨‍🏫 Started by: ${user ?? 'Unknown'}\n📄 Paper Code: ${paperCode ?? 'N/A'}\n⏱️ Duration: ${timeString ?? 'N/A'}`,
        )
        .setTimestamp();
}

export function sendExaminerSubmissionEmbed(channelId, candidate, attachment, guild) {
    const embed = new EmbedBuilder()
        .setTitle('📄 New Paper Submission')
        .setDescription('A candidate has submitted their solved paper for review.')
        .addFields(
            { name: '🆔 Session Channel ID', value: `\`${channelId ?? 'N/A'}\``, inline: true },
            { name: '🆔 Session Server ID', value: `\`${guild?.id ?? 'N/A'}\``, inline: true },
            {
                name: '🔗 Session Channel Link',
                value:
                    guild?.id && channelId
                        ? `[Click to view channel](https://discord.com/channels/${guild.id}/${channelId})`
                        : 'Unavailable',
                inline: false,
            },
            { name: '👤 Candidate', value: candidate?.tag ?? 'Unknown', inline: true },
            { name: '📎 File Name', value: attachment?.name ?? 'Unknown', inline: false },
        )
        .setColor('#2F3136')
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/337/337946.png')
        .setFooter({ text: 'PaperPulse Bot • Examiner Dashboard' })
        .setTimestamp();

    return embed;
}

export function getVerifiedEmbed({ examiner, channel, guild }) {
    return new EmbedBuilder()
        .setColor('#4ADE80') // Green color
        .setTitle('✅ Candidate Verified')
        .setDescription(
            `You have been verified by **${examiner?.tag ?? 'Unknown'}** for the paper session.`,
        )
        .addFields(
            { name: '🧑‍🏫 Examiner', value: examiner?.tag ?? 'Unknown', inline: true },
            {
                name: '🗂️ Session ID (Channel)',
                value:
                    channel?.name && guild?.id
                        ? `[${channel.name}](https://discord.com/channels/${guild.id}/${channel.id})`
                        : 'Unavailable',
                inline: true,
            },
            { name: '🧾 Server ID', value: guild?.id ?? 'N/A', inline: true },
            { name: '🧾 Paper Channel ID', value: channel?.id ?? 'N/A', inline: false },
        )
        .setFooter({ text: 'PaperPulseBot • Verification Complete' })
        .setTimestamp();
}

export function getAwardEmbed({ candidate, examiner, marks, guildId, channelId }) {
    return new EmbedBuilder()
        .setTitle('🏅 You Have Been Awarded Marks!')
        .setDescription('Your performance has been evaluated.')
        .setColor('#4CAF50')
        .addFields(
            {
                name: '👤 Candidate',
                value: candidate?.id ? `<@${candidate.id}>` : 'Unknown',
                inline: true,
            },
            { name: '🧑‍🏫 Examiner', value: examiner?.tag ?? 'Unknown', inline: true },
            { name: '📊 Marks Awarded', value: `**${marks ?? 'N/A'}**`, inline: true },
            { name: '🗂️ Session ID', value: `\`${channelId ?? 'N/A'}\`` },
            { name: '🌐 Server ID', value: `\`${guildId ?? 'N/A'}\`` },
            {
                name: '🔗 Paper Channel',
                value:
                    guildId && channelId
                        ? `[Jump to session](https://discord.com/channels/${guildId}/${channelId})`
                        : 'Unavailable',
            },
        )
        .setFooter({ text: 'PaperPulse • Marks Award System' })
        .setTimestamp();
}

export function generateProfileEmbed(user, member, sessionStats) {
    const { totalSessions, verifiedSessions, averageMarks, highestMarks, recentSession } =
        sessionStats ?? {};

    const embed = new EmbedBuilder()
        .setTitle(`📄 Profile: ${user?.username ?? 'Unknown'}`)
        .setThumbnail(user?.displayAvatarURL?.({ dynamic: true }) ?? null)
        .setColor('#5865F2')
        .addFields(
            { name: '🧑‍🎓 Total Sessions Taken', value: `${totalSessions ?? 0}`, inline: true },
            { name: '✅ Verified Sessions', value: `${verifiedSessions ?? 0}`, inline: true },
            { name: '📊 Average Marks', value: `${averageMarks ?? 'N/A'}`, inline: true },
            { name: '🏅 Highest Marks', value: `${highestMarks ?? 'N/A'}`, inline: true },
            {
                name: '📅 Joined Server',
                value: member?.joinedTimestamp
                    ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`
                    : 'N/A',
                inline: true,
            },
            { name: '🆔 User ID', value: `${user?.id ?? 'N/A'}`, inline: true },
            { name: '🔖 Tag', value: `${user?.tag ?? 'Unknown'}`, inline: true },
        )
        .setFooter({ text: 'PaperPulse | Candidate Profile Overview' })
        .setTimestamp();

    if (recentSession) {
        embed.addFields({
            name: '🕓 Most Recent Session',
            value: [
                `• **Channel:** ${recentSession.channelId ? `<#${recentSession.channelId}>` : 'N/A'}`,
                `• **Marks:** ${recentSession.marks ?? 'N/A'}`,
                `• **Verified:** ${recentSession.verified ? 'Yes' : 'No'}`,
                `• **Examiner:** ${recentSession.examinerId ? `<@${recentSession.examinerId}>` : 'N/A'}`,
                `• **Started:** ${
                    recentSession.createdAt
                        ? `<t:${Math.floor(recentSession.createdAt / 1000)}:R>`
                        : 'N/A'
                }`,
            ].join('\n'),
        });
    }

    return embed;
}

export function generateAllSessionsEmbed(sessions, user) {
    const embed = new EmbedBuilder()
        .setTitle(`📚 All Sessions: ${user?.username ?? 'Unknown'}`)
        .setThumbnail(user?.displayAvatarURL?.({ dynamic: true }) ?? null)
        .setColor('#00BFFF')
        .setFooter({ text: 'PaperPulse | All Sessions Overview' })
        .setTimestamp();

    if (!sessions?.length) {
        embed.setDescription('No sessions found for this candidate.');
        return embed;
    }

    for (const session of sessions) {
        const created = session?.createdAt
            ? `<t:${Math.floor(session.createdAt / 1000)}:R>`
            : 'N/A';

        embed.addFields({
            name: `📝 Session in ${session?.channelId ? `<#${session.channelId}>` : 'Unknown'}`,
            value: [
                `• **Marks:** ${session?.marks ?? 'N/A'}`,
                `• **Verified:** ${session?.verified ? '✅ Yes' : '❌ No'}`,
                `• **Examiner:** ${session?.examinerId ? `<@${session.examinerId}>` : 'Unknown'}`,
                `• **Started:** ${created}`,
            ].join('\n'),
            inline: false,
        });
    }

    return embed;
}

export function getLeaderboardEmbed(leaderboardData) {
    const leaderboardText = leaderboardData?.length
        ? leaderboardData
              .map((entry, index) => {
                  const percentage =
                      entry?.total > 0 ? ((entry.scored / entry.total) * 100).toFixed(1) : '0';
                  return `**#${index + 1}** ${entry?.username ?? 'Unknown'} — **${entry?.scored ?? 0}/${entry?.total ?? 0} marks** (${percentage}%)`;
              })
              .join('\n')
        : '_No verified candidate marks found yet._';

    return new EmbedBuilder()
        .setTitle('🏆 Leaderboard')
        .setDescription(`Top candidates ranked by total marks\n\n${leaderboardText}`)
        .setColor('#FACC15') // Tailwind yellow-400
        .setTimestamp();
}
