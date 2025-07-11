async function handleProfile(interaction) {
    await interaction.reply({
        content: `Profile command is working!`,
    });
}

module.exports = {
    handleProfile
}