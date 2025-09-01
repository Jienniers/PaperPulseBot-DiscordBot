const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

//utility function
function makeButton(customId, label, style) {
    return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}

// Returns the action buttons shown in the paper channel when /startpaper is used
function createPaperButtons() {
    return new ActionRowBuilder().addComponents(
        makeButton('done', 'Done!', ButtonStyle.Primary),
        makeButton('close', 'Stop/Close', ButtonStyle.Danger),
    );
}

// Returns the action buttons shown when /profile is used
function createProfileCommandButtons() {
    return new ActionRowBuilder().addComponents(
        makeButton('view_sessions', '📘 View All Sessions', ButtonStyle.Primary),
    );
}

module.exports = {
    createPaperButtons,
    createProfileCommandButtons,
};
