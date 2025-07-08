require('dotenv').config();

const { Client,
    GatewayIntentBits,
    Events } = require('discord.js');

const { createPaperEmbed, sendExaminerSubmissionEmbed } = require('./utils/embeds');
const { createPaperButtons } = require('./utils/buttons');
const { getConfig } = require('./utils/config');
const { formatPaperTime } = require('./utils/time');

//commands
const { handleAddCommand, paperRunningMap } = require('./commands/add');

const client = new Client({
    intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent]
});

const paperChannels = []
const candidatesMap = new Map();
const paperTimeMinsMap = new Map();
const examinersMap = new Map();


client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        await message.reply('Pong!');
    }

    await handleAddCommand(message, paperChannels, candidatesMap, paperTimeMinsMap.get(message.channel.id));
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'startpaper') {
        if (paperChannels.includes(interaction.channel.id)) {
            await interaction.reply({
                content: "You can not use this command here.",
                flags: 64
            });
            return;
        }

        const paperCode = interaction.options.getString('paper');
        const examiner = interaction.options.getUser('examiner')

        const config = getConfig()

        // flags: 64 is used for that "Only you can see this message" thing
        await interaction.deferReply({ flags: 64 });

        const paperChannel = await interaction.guild.channels.create({
            name: `${paperCode.split('/')[0]} by ${examiner.username}`,
            type: 0,
            parent: config.category_id,
        })

        examinersMap.set(paperChannel.id, examiner)

        paperTimeMinsMap.set(paperChannel.id, interaction.options.getInteger('time'));

        paperChannels.push(paperChannel.id);

        candidatesMap.set(paperChannel.id, [])

        const timeString = formatPaperTime(paperTimeMinsMap.get(paperChannel.id));

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
    }

    if (interaction.commandName === "upload") {
        if (!paperChannels.includes(interaction.channel.id)) {
            await interaction.reply({
                content: "You can not use this command here.",
                flags: 64
            });
            return;
        }

        const attachment = interaction.options.getAttachment('file');
        const channelID = interaction.channel.id;

        await interaction.deferReply({ ephemeral: true });

        const isPDF =
            attachment?.contentType?.includes("pdf") ||
            attachment?.name?.toLowerCase().endsWith(".pdf");

        if (!isPDF) {
            console.log("No PDF")
            return await interaction.editReply({
                content: '❌ Only PDF files are allowed. Please upload a `.pdf` file.',
                ephemeral: true
            });
        }

        await interaction.editReply({
            content: `✅ Received your PDF paper file: **${attachment.name}**`,
            ephemeral: true
        });
        examinersMap.get(channelID).send({
            content: `You have received a new paper submission.`,
            embeds: [sendExaminerSubmissionEmbed(channelID, interaction.user, attachment, interaction.guild)],
            files: [attachment]
        });
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    const buttonIDs = interaction.customId

    if (buttonIDs === 'done') {
        await interaction.reply({
            content: 'Please stop writing and put your pen down.',
            ephemeral: true
        });
        await interaction.channel.send(`${interaction.user} completed the paper!`)
    } else if (buttonIDs === 'close') {
        const channelID = interaction.channel.id

        const index = paperChannels.indexOf(channelID);
        if (index > -1) {
            paperChannels.splice(index, 1)
        }

        candidatesMap.delete(channelID)

        paperTimeMinsMap.delete(channelID)

        paperRunningMap.delete(channelID)

        examinersMap.delete(channelID)

        await interaction.channel.delete()
    }
});

client.login(process.env.TOKEN);
