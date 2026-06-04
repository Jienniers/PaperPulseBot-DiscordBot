import { state } from '../../data/state.js';

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export default async function handleSet(interaction) {
    const { options, guild, guildId } = interaction;

    const option = options.getNumber('value');

    await interaction.deferReply({ flags: 64 });

    state.guilds[guildId].categoryId = option;

    interaction.editReply({ content: `Category ID has been set to: ${String(option)}`, flags: 64 });
}
