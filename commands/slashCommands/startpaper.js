const path = require('path');
const { getConfig } = require(path.resolve(__dirname, '..', '..', 'utils', 'common', 'config.js'));
const { formatPaperTime } = require(path.resolve(__dirname, '..', '..', 'utils', 'common', 'time.js'));
const { createPaperEmbed } = require(path.resolve(__dirname, '..', '..', 'utils', 'discord', 'embeds.js'));
const { createPaperButtons } = require(path.resolve(__dirname, '..', '..', 'utils', 'discord', 'buttons.js'));

const { examinersMap, paperChannels, paperTimeMinsMap } = require(
    path.resolve(__dirname, '..', '..', 'data', 'state.js'),
);

async function handleStartPaper(interaction) {
    const channelId = interaction.channel.id;
    const guild = interaction.guild;
    const user = interaction.user;

    if (paperChannels.includes(channelId)) {
        return interaction.reply({
            content: '❌ You cannot use this command here.',
            flags: 64,
        });
    }

    const paperCode = interaction.options.getString('paper')?.trim();
    const examiner = interaction.options.getUser('examiner');
    const paperTime = interaction.options.getInteger('time');
    const config = getConfig();

    if (!paperCode || !examiner || !paperTime) {
        return interaction.reply({
            content: '❌ Missing required options. Please provide paper code, examiner, and time.',
            flags: 64,
        });
    }

    if (!/^\d{4}\/\d{1,2}$/.test(paperCode)) {
        return await interaction.reply({
            content: '❌ Please provide paper code in the format `code/variant`, like `0580/12`.',
            flags: 64,
        });
    }

    if (examiner.bot) {
        return interaction.reply({
            content: '❌ You cannot make examiner a bot.',
            flags: 64,
        });
    }

    await interaction.deferReply({ flags: 64 });

    const channelName = `${paperCode.split('/')[0]} by ${examiner.username}`;

    let paperChannel;
    try {
        paperChannel = await guild.channels.create({
            name: channelName,
            type: 0,
            parent: config.category_id,
        });
    } catch (err) {
        console.error('❗ Failed to create paper channel:', err.message);
        return interaction.editReply({
            content: '❌ Failed to create paper channel. Check permissions or try again later.',
            flags: 64,
        });
    }

    examinersMap.set(paperChannel.id, examiner.id);
    paperTimeMinsMap.set(paperChannel.id, paperTime);
    paperChannels.push(paperChannel.id);

    const timeString = formatPaperTime(paperTime);
    const embed = createPaperEmbed(user, paperCode, timeString);
    const buttonsRow = createPaperButtons();

    await paperChannel.send({
        content: `👋 Hello ${user}, starting the paper **${paperCode}**!`,
        embeds: [embed],
        components: [buttonsRow],
    });

    await interaction.editReply({
        content: `✅ A new channel has been created for this paper session: <#${paperChannel.id}>`,
        flags: 64,
    });
}

module.exports = {
    handleStartPaper,
};
