async function handleDoneButton(interaction, channelID, variables) {
    const examinersMap = variables[4];
    if (interaction.user.id === examinersMap.get(channelID)?.id) return;

    await interaction.reply({
        content: 'Please stop writing and put your pen down.',
        flags: 64
    });
    await interaction.channel.send(`${interaction.user} completed the paper!`);
}

async function handleCloseButton(interaction, channelID, variables) {
    const paperChannels = variables[0]
    const candidatesMap = variables[1]
    const paperTimeMinsMap = variables[2]
    const paperRunningMap = variables[3]
    const examinersMap = variables[4]

    if (interaction.user.id !== examinersMap.get(channelID)?.id) {
        await interaction.reply({
            content: '❌ You are not authorized to close this paper session.',
            flags: 64
        });
        return;
    }

    //clearing up all the maps and array after you delete the channel in this button function

    const index = paperChannels.indexOf(channelID);
    if (index > -1) paperChannels.splice(index, 1);

    candidatesMap.delete(channelID);
    paperTimeMinsMap.delete(channelID);
    paperRunningMap.delete(channelID);
    examinersMap.delete(channelID);

    interaction.channel.delete();
}

// 🔧 Maps button IDs to their corresponding handler functions
const buttonHandlers = {
    done: handleDoneButton,
    close: handleCloseButton
    // Add more handlers as needed
};

module.exports = { buttonHandlers }