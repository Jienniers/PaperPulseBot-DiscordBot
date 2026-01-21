import {
    examinersMap,
    paperChannels,
    doubleKeyMaps,
    candidateSessionsMap,
} from '../../data/state.js';

import { getAwardEmbed } from '../../utils/discord/embeds.js';

export async function handleAward(interaction, client) {
    const channelID = interaction.channel.id;
    const userOption = interaction.options.getUser('user');
    const marksOption = interaction.options.getString('marks');
    const examiner = examinersMap.get(channelID);

    if (!paperChannels.includes(channelID)) {
        return await interaction.reply({
            content: '❌ You cannot use this command here.',
            flags: 64,
        });
    }

    if (userOption.bot) {
        return await interaction.reply({
            content: '❌ You cannot award marks to a bot.',
        });
    }

    if (interaction.user.id !== examiner) {
        return await interaction.reply({
            content: '❌ You are not authorized to award marks to candidates.',
            flags: 64,
        });
    }

    if (examiner === userOption.id) {
        return await interaction.reply({
            content: '❌ You cannot award marks to an examiner.',
        });
    }

    if (!/^\d{1,3}\/\d{1,3}$/.test(marksOption)) {
        return await interaction.reply({
            content: '❌ Please provide marks in the format `score/total`, like `70/100`.',
            flags: 64,
        });
    }

    const key = doubleKeyMaps(userOption.id, channelID);
    const candidateData = candidateSessionsMap.get(key);

    if (!candidateData) {
        return await interaction.reply({
            content: '❌ There were no users added in this session nor the paper was started.',
        });
    }

    candidateData.marks = marksOption;

    await interaction.reply({
        content: `${userOption} has been awarded ${marksOption} marks.`,
    });

    const examinerUser = client.users.cache.get(examiner);

    const embed = getAwardEmbed({
        candidate: userOption,
        examiner: examinerUser,
        marks: marksOption,
        guildId: interaction.guild.id,
        channelId: channelID,
    });

    try {
        await userOption.send({ embeds: [embed] });
    } catch (err) {
        console.warn(`❗ Failed to send DM to user ${userOption.id}:`, err.message);
    }
}
