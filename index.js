require('dotenv').config();

const { Client, GatewayIntentBits, Events } = require('discord.js');

const { buttonHandlers } = require('./utils/buttonHandlers');

let { paperChannels } = require('./data/state');

//commands
const { handleAddCommand } = require('./commands/messageCommands/add');
const { handleStartPaper } = require('./commands/slashCommands/startpaper');
const { handleUpload } = require('./commands/slashCommands/upload');
const { handleVerify } = require('./commands/slashCommands/verify');
const { handleAward } = require('./commands/slashCommands/award');
const { handleProfile } = require('./commands/slashCommands/profile');
const { handleLeaderboard } = require('./commands/slashCommands/leaderboard');

//database
const connectToMongoDB = require('./utils/mongo');
const { updatePaperChannelsInDB, getPaperChannels } = require('./database/paperChannelsService');

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

        const channelsFromDB = await getPaperChannels();

        paperChannels.length = 0;
        paperChannels.push(...channelsFromDB);

        setInterval(() => {
            updatePaperChannelsInDB(paperChannels);
        }, 3000);
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
        await handleAward(interaction);
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