import 'dotenv/config';
import { REST, Routes } from 'discord.js';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('⚠️ Deleting all guild commands...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [] }, // 👈 This empties the command list
        );

        console.log('✅ All guild slash commands deleted.');
    } catch (error) {
        console.error('❌ Failed to delete guild commands:', error);
    }
})();
