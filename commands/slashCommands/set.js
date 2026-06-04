import { state } from '../../data/state.js';
import { PermissionsBitField } from 'discord.js';

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export default async function handleSet(interaction) {
    const { options, guildId, member } = interaction;

    const option = options.getString('value');

    await interaction.deferReply({ flags: 64 });

    // 🚫 Permission check (Admin only)
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.editReply({
            content: '❌ You need **Administrator** permission to use this command.',
            flags: 64,
        });
    }

    if (!state.guilds[guildId]) {
        state.guilds[guildId] = {
            sessions: {},
        };
    }

    state.guilds[guildId].categoryId = option;

    return interaction.editReply({
        content: `✅ Category ID has been set to: ${option}`,
        flags: 64,
    });
}