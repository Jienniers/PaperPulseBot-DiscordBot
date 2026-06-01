import 'dotenv/config';

import { REST, Routes } from 'discord.js';

import commands from '../commands/slashCommands/definitions.js';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            {
                body: commands,
            },
        );

        console.log('Slash commands registered successfully. ✅');
    } catch (err) {
        console.error('Error registering commands.', err);
    }
})();
