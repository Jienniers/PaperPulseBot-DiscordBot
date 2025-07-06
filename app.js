require('dotenv').config();
const fs = require('fs');

const { Client,
    GatewayIntentBits,
    Events } = require('discord.js');

const { createPaperEmbed } = require('./utils/embeds');
const { createPaperButtons } = require('./utils/buttons');
const { getConfig } = require('./utils/config');
const { formatPaperTime } = require('./utils/time');

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
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'startpaper') {
        const paperCode = interaction.options.getString('paper');
        const paperTimeMins = interaction.options.getInteger('time');
        const examiner = interaction.options.getUser('examiner')

        const config = getConfig()

        await interaction.deferReply({ ephemeral: true });

        const paperChannel = await interaction.guild.channels.create({
            name: `${paperCode} paper code`,
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


client.on(Events.MessageCreate, (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith("!add") && paperChannels.includes(message.channel.id)) {
        const sessionCandidates = candidatesMap.get(message.channel.id);
        console.log(paperChannels)

        const mentionedUsers = message.mentions.users;

        if (mentionedUsers.size === 0) {
            return message.reply("❌ No users mentioned.");
        }

        mentionedUsers.forEach(user => {
            console.log(`Mentioned: ${user.username} (${user.id})`);
            sessionCandidates.push(user)
        });

        const candidates = sessionCandidates.join(` `)

        message.channel.send(`Following candidates have been added: ${candidates}`)
    }
});


client.login(process.env.TOKEN);
