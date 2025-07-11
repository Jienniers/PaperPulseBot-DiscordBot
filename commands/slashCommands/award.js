const path = require('path');
const { examinersMap, paperChannels, doubleKeyMaps, candidateSessionsMap } = require(
    path.resolve(__dirname, '..', '..', 'data', 'state.js'),
);

const { getAwardEmbed } = require(path.resolve(__dirname, '..', '..', 'utils', 'embeds.js'));

async function handleAward(interaction) {
    const channelID = interaction.channel.id;
    const userOption = interaction.options.getUser('user');
    const marksOption = interaction.options.getString('marks');
    const examiner = examinersMap.get(channelID);

    const key = doubleKeyMaps(userOption.id, channelID);
    const candidateData = candidateSessionsMap.get(key);

    if (!paperChannels.includes(channelID)) {
        return await interaction.reply({
            content: '❌ You cannot use this command here.',
            flags: 64,
        });
    }
    if (interaction.user.id !== examinersMap.get(channelID)?.id) {
        return await interaction.reply({
            content: '❌ You are not authorized to award marks to candidates.',
            flags: 64,
        });
    }

    if (examinersMap.get(channelID)?.id === userOption.id) {
        return await interaction.reply({
            content: '❌ You cannot award marks to an examiner.',
        });
    }

    if (!candidateData) {
        return await interaction.reply({
            content: '❌ There were no users added in this session nor the paper was started.',
        });
    }

    if (candidateData) {
        candidateData.marks = marksOption

        await interaction.reply({
            content: `${userOption} has been awarded ${marksOption} marks.`,
        });
    }

    const embed = getAwardEmbed({
        candidate: userOption,
        examiner: examiner,
        marks: marksOption,
        guildId: interaction.guild.id,
        channelId: channelID,
    });

    await userOption.send({ embeds: [embed] });
}

module.exports = {
    handleAward,
};
