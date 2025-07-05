require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('startpaper')
        .setDescription('Starts the paper with timer.')
        .addStringOption(option =>
            option.setName('paper')
                .setDescription('Paper Code e.g 0580-12')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Paper Time (mins) e.g 60')
                .setRequired(true))
        .addUserOption(option =>
            option.setName("examiner")
                .setDescription("Assign an examiner")
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
