const PaperChannelsModel = require('../models/paperChannels');

async function getPaperChannels() {
    let doc = await PaperChannelsModel.findOne();
    if (!doc) {
        doc = new PaperChannelsModel();
        await doc.save();
    }
    return doc.channels;
}

async function setPaperChannels(channels) {
    let doc = await PaperChannelsModel.findOne();
    if (!doc) {
        doc = new PaperChannelsModel();
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
