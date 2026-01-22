import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

//utility function
function makeButton(customId, label, style) {
    return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}

// Returns the action buttons shown in the paper channel when /startpaper is used
export function createPaperButtons() {
    return new ActionRowBuilder().addComponents(
        makeButton('close', 'Stop/Close', ButtonStyle.Danger),
    );
}

// Returns the action buttons shown when /profile is used
export function createProfileCommandButtons() {
    return new ActionRowBuilder().addComponents(
        makeButton('view_sessions', '📘 View All Sessions', ButtonStyle.Primary),
    );
}
