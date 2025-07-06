const { EmbedBuilder } = require('discord.js');

function createPaperEmbed(user, paperCode, timeString) {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("📝 Paper Started, Good Luck!")
        .setDescription(`👨‍🏫 Started by: ${user}\n📄 Paper Code: ${paperCode}\n⏱️ Duration: ${timeString}`)
        .setTimestamp();
}

module.exports = { createPaperEmbed };
