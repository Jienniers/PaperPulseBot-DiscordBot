require('dotenv').config();

const fs = require('fs');
const { Client,
    GatewayIntentBits,
    Events } = require('discord.js');

const { createPaperEmbed } = require('./utils/embeds');
const { createPaperButtons } = require('./utils/buttons');
const { getConfig } = require('./utils/config');
const { formatPaperTime } = require('./utils/time');
const { handleAddCommand } = require('./utils/messageHandlers');

const client = new Client({
    intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent]
});

const paperChannels = []
const candidatesMap = new Map()

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.MessageCreate, message => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        message.reply('Pong!');
    }

    handleAddCommand(message, paperChannels, candidatesMap);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'startpaper') {
        const paperCode = interaction.options.getString('paper');
        const paperTimeMins = interaction.options.getInteger('time');
        const examiner = interaction.options.getUser('examiner')

        const config = getConfig()

        // flags: 64 is used for that "Only you can see this message" thing
        await interaction.deferReply({ flags: 64 });

        const paperChannel = await interaction.guild.channels.create({
            name: `${paperCode.split('/')[0]} by ${examiner.username}`,
            type: 0,
            parent: config.category_id,
        })

        paperChannels.push(paperChannel.id);

        candidatesMap.set(paperChannel.id, [])

        const timeString = formatPaperTime(paperTimeMins);

        const embed = createPaperEmbed(interaction.user, paperCode, timeString);

        const buttonsRow = createPaperButtons();

        await paperChannel.send({
            content: `👋 Hello, ${interaction.user} Starting the Paper ${paperCode}!!`,
            embeds: [embed],
            components: [buttonsRow],
        })

        await interaction.editReply(
            `A new channel has been created for this paper <#${paperChannel.id}>!`,
        );

        setTimeout(() => {
            paperChannel.channel.send(`⏰ Time's up! Please stop writing and put your pen down.`);
        }, paperTimeMins * 60 * 1000);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'done') {
        await interaction.reply({
            content: 'Please stop writing and put your pen down.',
            ephemeral: true
        });
        await interaction.channel.send(`${interaction.user} completed the paper!`)
    }
});

client.login(process.env.TOKEN);
