import { SlashCommandBuilder } from 'discord.js';

const slashCommands = [
    new SlashCommandBuilder()
        .setName('startpaper')
        .setDescription('Start a new paper session with a timer and assign an examiner.')
        .addStringOption((option) =>
            option
                .setName('paper')
                .setDescription('Enter the paper code (e.g., 0580/12).')
                .setRequired(true),
        )
        .addIntegerOption((option) =>
            option
                .setName('time')
                .setDescription('Set the duration of the paper in minutes (e.g., 60).')
                .setRequired(true),
        )
        .addUserOption((option) =>
            option
                .setName('examiner')
                .setDescription('Select a user to assign as the examiner for this session.')
                .setRequired(true),
        ),

    new SlashCommandBuilder()
        .setName('upload')
        .setDescription('Upload your solved paper as a PDF for the assigned examiner to review.')
        .addAttachmentOption((option) =>
            option
                .setName('file')
                .setDescription('Attach your solved paper as a PDF file.')
                .setRequired(true),
        ),

    new SlashCommandBuilder()
        .setName('verify')
        .setDescription(
            "Verify the candidate's paper after confirming it was completed fairly and without cheating.",
        )
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Enter the candidate you want to verify.')
                .setRequired(true),
        ),

    new SlashCommandBuilder()
        .setName('award')
        .setDescription('Award marks to a candidate')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Enter the candidate you want to award marks to.')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName('marks')
                .setDescription('Enter the awarded marks (e.g., 80/100)')
                .setRequired(true),
        ),

    new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View the profile of a candidate.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Enter the candidate you want to view profile of.')
                .setRequired(false),
        ),

    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the leaderboard of the current channel'),

    new SlashCommandBuilder()
        .setName('set')
        .setDescription('Configure PaperPulse settings.')
        .addStringOption((option) =>
            option
                .setName('setting')
                .setDescription('Select the setting to configure.')
                .setRequired(true)
                .addChoices({
                    name: 'Paper Category',
                    value: 'category',
                })
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName('value')
                .setDescription('Enter the new value for the selected setting.')
                .setRequired(true),
        ),
].map((command) => command.toJSON());

export default slashCommands;
