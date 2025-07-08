require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('startpaper')
        .setDescription('Start a new paper session with a timer and assign an examiner.')
        .addStringOption(option =>
            option.setName('paper')
                .setDescription('Enter the paper code (e.g., 0580/12).')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Set the duration of the paper in minutes (e.g., 60).')
                .setRequired(true))
        .addUserOption(option =>
            option.setName("examiner")
                .setDescription("Select a user to assign as the examiner for this session.")
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName("upload")
        .setDescription("Upload your solved paper as a PDF for the assigned examiner to review.")
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('Attach your solved paper as a PDF file.')
                .setRequired(true))

].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering slash command...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('Slash command registered ✅');
    } catch (err) {
        console.error('Error registering command:', err);
    }
})();
