const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createPaperButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('done')
            .setLabel('Done!')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('close')
            .setLabel("Stop/Close")
            .setStyle(ButtonStyle.Danger)
    );
}

module.exports = { createPaperButtons };
