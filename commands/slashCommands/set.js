import { state } from '../../data/state.js';

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export default async function handleSet(interaction) {
    const { options, guildId } = interaction;

    const option = options.getString('value');

    await interaction.deferReply({ flags: 64 });

    if (!state.guilds[guildId]) {
        state.guilds[guildId] = {
            sessions: {},
        };
    }

    state.guilds[guildId].categoryId = option;

    return interaction.editReply({
        content: `Category ID has been set to: ${option}`,
        flags: 64,
    });
}
