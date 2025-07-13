const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Returns the action buttons shown in the paper channel when /startpaper is used
function createPaperButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('done').setLabel('Done!').setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('close')
            .setLabel('Stop/Close')
            .setStyle(ButtonStyle.Danger),
    );
}

function createProfileCommandButtons() {
    const buttonsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('view_sessions')
            .setLabel('📘 View All Sessions')
            .setStyle(ButtonStyle.Primary),
    );
    return buttonsRow;
}

module.exports = {
    createPaperButtons,
    createProfileCommandButtons,
};
