const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createPaperButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('done')
            .setLabel('Done!')
            .setStyle(ButtonStyle.Primary)
    );
}

module.exports = { createPaperButtons };
