require('dotenv').config();
const { Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent]
});


client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'startpaper') {
        const paperCode = interaction.options.getString('paper');
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Started the Paper, Good Luck!")
            .setDescription(`Started by: ${interaction.user}
                            Paper Code: ${paperCode}`)
            .setTimestamp();

        const buttonsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('done')
                .setLabel('Done!')
                .setStyle(ButtonStyle.Primary)
        )

        await interaction.reply({
            content: `👋 Hello, ${interaction.user} Starting the Paper ${paperCode}!!`,
            embeds: [embed],
            components: [buttonsRow],
        })
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'done') {
        await interaction.reply({
            content: '🛑 Time is up! Please stop writing and put your pen down.',
            ephemeral: true
        });
        await interaction.channel.send(`${interaction.user} completed the paper!`)
    }
});

client.login(process.env.TOKEN);
