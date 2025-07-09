const path = require('path');
const { examinersMap, paperChannels } = require(
    path.resolve(__dirname, '..', '..', 'data', 'state.js'),
);

async function handleVerify(interaction) {
    const channelID = interaction.channel.id
    if (!paperChannels.includes(channelID)) {
        return interaction.reply({
            content: '❌ You cannot use this command here.',
            flags: 64,
        });
    };
    if (interaction.user.id !== examinersMap.get(channelID)?.id) {
        return await interaction.reply({
            content: '❌ You are not authorized to close this paper session.',
            flags: 64,
        });
    }

    interaction.reply("HELLOW")

}

module.exports = {
    handleVerify
};
