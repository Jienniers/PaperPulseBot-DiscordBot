import 'dotenv/config';

import { Client, GatewayIntentBits, Events } from 'discord.js';

//utils
import buttonHandlers from './utils/discord/buttonHandlers.js';

//commands
import handleAddCommand from './commands/messageCommands/add.js';
import handleStartPaper from './commands/slashCommands/startpaper.js';
import handleUpload from './commands/slashCommands/upload.js';
import handleVerify from './commands/slashCommands/verify.js';
import handleAward from './commands/slashCommands/award.js';
import handleProfile from './commands/slashCommands/profile.js';
import handleLeaderboard from './commands/slashCommands/leaderboard.js';

//database
import connectToMongoDB from './utils/database/mongoConnection.js';
import { initializeAndSyncState } from './utils/database/stateDatabaseSync.js';

function validateEnvironmentVariables() {
    const requiredVars = ['TOKEN', 'MONGO_URL', 'GUILD_ID', 'CATEGORY_ID'];
    const missing = requiredVars.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
        console.error(
            `❌ Missing required environment variables: ${missing.join(', ')}\n` +
                `Please set these in your .env file and try again.`,
        );
        process.exit(1);
    }
}

validateEnvironmentVariables();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

async function startBot() {
    await connectToMongoDB();

    client.once(Events.ClientReady, async () => {
        console.log(`Logged in as ${client.user.tag}!`);

        await initializeAndSyncState(client);
    });

    await client.login(process.env.TOKEN);
}

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        await message.reply('Pong!');
    }

    await handleAddCommand(message);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const commandHandlers = {
        startpaper: handleStartPaper,
        upload: handleUpload,
        verify: handleVerify,
        award: (i) => handleAward(i, client),
        profile: handleProfile,
        leaderboard: handleLeaderboard,
    };

    const handler = commandHandlers[interaction.commandName];
    if (handler) await handler(interaction);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const buttonID = interaction.customId;
    const channelID = interaction.channel.id;

    const handler = buttonHandlers[buttonID];
    if (handler) {
        await handler(interaction, channelID);
    }
});

await startBot();
