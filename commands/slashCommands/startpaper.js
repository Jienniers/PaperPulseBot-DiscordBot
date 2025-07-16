const path = require('path');
const { getConfig } = require(path.resolve(__dirname, '..', '..', 'utils', 'config.js'));
const { formatPaperTime } = require(path.resolve(__dirname, '..', '..', 'utils', 'time.js'));
const { createPaperEmbed } = require(path.resolve(__dirname, '..', '..', 'utils', 'embeds.js'));
const { createPaperButtons } = require(path.resolve(__dirname, '..', '..', 'utils', 'buttons.js'));

const { examinersMap, paperChannels, paperTimeMinsMap } = require(
    path.resolve(__dirname, '..', '..', 'data', 'state.js'),
);

async function handleStartPaper(interaction) {
    const channelId = interaction.channel.id;

    if (paperChannels.includes(channelId)) {
        return interaction.reply({
            content: '❌ You cannot use this command here.',
            flags: 64,
        });
    }

    const paperCode = interaction.options.getString('paper');
    const examiner = interaction.options.getUser('examiner');
    const paperTime = interaction.options.getInteger('time');
    const config = getConfig();

    if (examiner.bot) {
        return await interaction.reply({
            content: '❌ You cannot make examiner a bot.',
        });
    }

    await interaction.deferReply({ flags: 64 });

    const channelName = `${paperCode.split('/')[0]} by ${examiner.username}`;
    const paperChannel = await interaction.guild.channels.create({
        name: channelName,
        type: 0,
        parent: config.category_id,
    });

    examinersMap.set(paperChannel.id, examiner);
    paperTimeMinsMap.set(paperChannel.id, paperTime);
    paperChannels.push(paperChannel.id);

    const timeString = formatPaperTime(paperTime);
    const embed = createPaperEmbed(interaction.user, paperCode, timeString);
    const buttonsRow = createPaperButtons();

    await paperChannel.send({
        content: `👋 Hello ${interaction.user}, starting the paper **${paperCode}**!`,
        embeds: [embed],
        components: [buttonsRow],
    });

    await interaction.editReply(
        `✅ A new channel has been created for this paper session: <#${paperChannel.id}>`,
    );
}

module.exports = {
    handleStartPaper,
};
