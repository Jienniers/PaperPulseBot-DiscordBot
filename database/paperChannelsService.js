const PaperChannels = require('./models/paperChannels');
const PaperChannelsModel = require('./models/paperChannels');

async function getPaperChannels() {
    let doc = await PaperChannels.findOne();
    if (!doc) {
        doc = new PaperChannels();
        await doc.save();
    }
    return doc.channels;
}

async function setPaperChannels(channels) {
    let doc = await PaperChannels.findOne();
    if (!doc) {
        doc = new PaperChannels();
    }
    doc.channels = channels;
    await doc.save();
}

async function updatePaperChannelsInDB(paperChannels) {
    try {
        const doc = await PaperChannelsModel.findOne();

        if (!doc) {
            const newDoc = new PaperChannelsModel({ channels: paperChannels });
            await newDoc.save();
        } else {
            doc.channels = paperChannels;
            await doc.save();
        }
    } catch (err) {
        console.error('Failed to update paper channels:', err);
    }
}


module.exports = {
    getPaperChannels,
    setPaperChannels,
    updatePaperChannelsInDB,
};
