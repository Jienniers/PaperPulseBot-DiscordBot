const path = require('path');
const { examinersMap, paperChannels } = require(
    path.resolve(__dirname, '..', '..', 'data', 'state.js'),
);
async function handleAward(interaction) {
    const channelID = interaction.channel.id;
    const userOption = interaction.options.getUser('user');

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
}

module.exports = {
    handleAward,
};