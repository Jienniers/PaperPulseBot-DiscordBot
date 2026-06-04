import { state } from '../../data/state.js';
import { PermissionsBitField } from 'discord.js';

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export default async function handleSet(interaction) {
    const { options, guildId, member } = interaction;

    // ✅ correct option name from SlashCommandBuilder
    const setting = options.getString('setting');
    const value = options.getString('value'); 

    await interaction.deferReply({ flags: 64 });

    // 🚫 Admin-only check
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.editReply({
            content: '❌ You need **Administrator** permission to use this command.',
        });
    }

    if (!state.guilds[guildId]) {
        state.guilds[guildId] = {
            sessions: {},
            categoryId: null,
        };
    }

    // ✅ enforce only this choice
    if (setting === 'category') {
        state.guilds[guildId].categoryId = value;

        return interaction.editReply({
            content: `✅ Paper Category has been set to: ${value}`,
        });
    }

    return interaction.editReply({
        content: '❌ Invalid setting selected.',
    });
}
