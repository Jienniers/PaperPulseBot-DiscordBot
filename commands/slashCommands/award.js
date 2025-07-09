const path = require('path');
const { examinersMap, paperChannels, candidateMarksMap, doubleKeyMaps } = require(
    path.resolve(__dirname, '..', '..', 'data', 'state.js'),
);
async function handleAward(interaction) {
    const channelID = interaction.channel.id;
    const userOption = interaction.options.getUser('user');
    const marksOption = interaction.options.getString('marks');

    const key = doubleKeyMaps(userOption.id, channelID);

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

    candidateMarksMap.set(key, marksOption);

    if (candidateMarksMap.get(key)) {
        await interaction.reply({
            content: `${userOption} has been awarded ${marksOption} marks.`,
        });
    }
}

module.exports = {
    handleAward,
};