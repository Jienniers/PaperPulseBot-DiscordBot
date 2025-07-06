require('dotenv').config();
const fs = require('fs');

const { Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent]
});

const configFilePath = "./config.json"

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
        const paperTime = interaction.options.getInteger('time');
        const examiner = interaction.options.getUser('examiner')

        const raw = fs.readFileSync(configFilePath, 'utf-8');
        const config = JSON.parse(raw);

        if (!fs.existsSync(configFilePath)) {
            console.error('❌ config.json not found. Please copy it from examples/config.json and fill it.');
            process.exit(1);
        }

        await interaction.deferReply({ ephemeral: true });

        console.log(config.category_id);
        const paperChannel = await interaction.guild.channels.create({
            name: `${paperCode} paper code`,
            type: 0,
            parent: config.category_id,
        })

        paperChannels.push(paperChannel.id);

        candidatesMap.set(paperChannel.id, [])

        const hours = Math.floor(paperTime / 60);
        const minutes = paperTime % 60;

        const timeString = `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Started the Paper, Good Luck!")
            .setDescription(`Started by: ${interaction.user}
                            Paper Code: ${paperCode}
                            Time: ${timeString}`)
            .setTimestamp();

        const buttonsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('done')
                .setLabel('Done!')
                .setStyle(ButtonStyle.Primary)
        )

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
        }, paperTime * 60 * 1000);
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
