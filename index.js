require('dotenv').config();

const { Client,
    GatewayIntentBits,
    Events } = require('discord.js');

const { createPaperEmbed, sendExaminerSubmissionEmbed } = require('./utils/embeds');
const { createPaperButtons } = require('./utils/buttons');
const { getConfig } = require('./utils/config');
const { formatPaperTime } = require('./utils/time');
const { buttonHandlers } = require('./utils/buttonHandlers');

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

    const channelId = interaction.channel.id;

    // ───── 🧾 START PAPER COMMAND ─────
    if (interaction.commandName === 'startpaper') {
        if (paperChannels.includes(channelId)) {
            return interaction.reply({
                content: '❌ You cannot use this command here.',
                flags: 64 // ephemeral
            });
        }

        const paperCode = interaction.options.getString('paper');
        const examiner = interaction.options.getUser('examiner');
        const paperTime = interaction.options.getInteger('time');
        const config = getConfig();

        await interaction.deferReply({ flags: 64 });

        const channelName = `${paperCode.split('/')[0]} by ${examiner.username}`;
        const paperChannel = await interaction.guild.channels.create({
            name: channelName,
            type: 0, // GuildText
            parent: config.category_id
        });

        // Save session-specific state
        examinersMap.set(paperChannel.id, examiner);
        paperTimeMinsMap.set(paperChannel.id, paperTime);
        candidatesMap.set(paperChannel.id, []);
        paperChannels.push(paperChannel.id);

        const timeString = formatPaperTime(paperTime);
        const embed = createPaperEmbed(interaction.user, paperCode, timeString);
        const buttonsRow = createPaperButtons();

        await paperChannel.send({
            content: `👋 Hello ${interaction.user}, starting the paper **${paperCode}**!`,
            embeds: [embed],
            components: [buttonsRow]
        });

        await interaction.editReply(`✅ A new channel has been created for this paper <#${paperChannel.id}>!`);
    }

    // ───── 📤 UPLOAD PAPER COMMAND ─────
    if (interaction.commandName === 'upload') {
        if (!paperChannels.includes(channelId)) {
            return interaction.reply({
                content: '❌ You cannot use this command here.',
                flags: 64
            });
        }

        const attachment = interaction.options.getAttachment('file');
        await interaction.deferReply({ flags: 64 });

        // Strict and safe PDF check
        const isPDF =
            attachment?.contentType?.toLowerCase() === 'application/pdf' ||
            attachment?.name?.toLowerCase().endsWith('.pdf');

        if (!isPDF) {
            return interaction.editReply({
                content: '❌ Only PDF files are allowed. Please upload a `.pdf` file.',
                flags: 64
            });
        }

        await interaction.editReply({
            content: `✅ Received your PDF file: **${attachment.name}**`,
            flags: 64
        });

        const examiner = examinersMap.get(channelId);
        if (examiner) {
            await examiner.send({
                content: '📩 A new paper submission has been received.',
                embeds: [sendExaminerSubmissionEmbed(channelId, interaction.user, attachment, interaction.guild)],
                files: [attachment]
            });
        }
    }
});

// Listen for all button interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    const buttonID = interaction.customId;
    const channelID = interaction.channel.id;

    // Look up the handler for this button by custom ID
    const handler = buttonHandlers[buttonID];
    if (handler) {
        await handler(interaction, channelID, [paperChannels, candidatesMap, paperTimeMinsMap, paperRunningMap, examinersMap]);
    }
});

client.login(process.env.TOKEN);