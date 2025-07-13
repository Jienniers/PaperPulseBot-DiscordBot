require('dotenv').config();

const { Client, GatewayIntentBits, Events } = require('discord.js');

const { buttonHandlers } = require('./utils/buttonHandlers');

//commands
const { handleAddCommand } = require('./commands/messageCommands/add');
const { handleStartPaper } = require('./commands/slashCommands/startpaper');
const { handleUpload } = require('./commands/slashCommands/upload');
const { handleVerify } = require('./commands/slashCommands/verify');
const { handleAward } = require('./commands/slashCommands/award');
const { handleProfile } = require('./commands/slashCommands/profile');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

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

client.login(process.env.TOKEN);
