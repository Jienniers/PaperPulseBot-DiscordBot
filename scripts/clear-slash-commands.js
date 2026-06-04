/**
 * Utility script for manual command management.
 * Not required during normal bot operation.
 */


import 'dotenv/config';

import { REST, Routes } from 'discord.js';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('⚠️ Deleting ALL slash commands...');

        // 1. Delete GLOBAL commands
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });

        // 2. Delete GUILD commands
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [] },
        );

        console.log('✅ All slash commands deleted (global + guild).');
    } catch (error) {
        console.error('❌ Failed to delete commands:', error);
    }
})();
