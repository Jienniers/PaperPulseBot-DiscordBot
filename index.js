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

    // ───── 🧾 START PAPER COMMAND ─────
    if (interaction.commandName === 'startpaper') {
        await handleStartPaper(interaction);
    }

    // ───── 📤 UPLOAD PAPER COMMAND ─────
    if (interaction.commandName === 'upload') {
        await handleUpload(interaction);
    }

    // ───── ✔️ VERIFY PAPER COMMAND ─────
    if (interaction.commandName === 'verify') {
        await handleVerify(interaction);
    }

    // ───── 🏆 AWARD PAPER COMMAND ─────
    if (interaction.commandName === 'award') {
        await handleAward(interaction, client);
    }

    // ───── 👤 PROFILE COMMAND ─────
    if (interaction.commandName === 'profile') {
        await handleProfile(interaction);
    }

    // ───── 📊 LEADERBOARD COMMAND ─────
    if (interaction.commandName === 'leaderboard') {
        await handleLeaderboard(interaction);
    }
});

// Listen for all button interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const buttonID = interaction.customId;
    const channelID = interaction.channel.id;

    // Look up the handler for this button by custom ID
    const handler = buttonHandlers[buttonID];
    if (handler) {
        await handler(interaction, channelID);
    }
});

startBot();
