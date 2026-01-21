import PaperChannels from '../models/index.js';


export async function getPaperChannels() {
    let doc = await PaperChannels.findOne();
    if (!doc) {
        doc = new PaperChannels();
        await doc.save();
    }
    return doc.channels;
}

export async function setPaperChannels(channels) {
    let doc = await PaperChannels.findOne();
    if (!doc) {
        doc = new PaperChannels();
    }
    doc.channels = channels;
    await doc.save();
}

export async function updatePaperChannelsInDB(paperChannels) {
    try {
        const doc = await PaperChannels.findOne();

        if (!doc) {
            const newDoc = new PaperChannels({ channels: paperChannels });
            await newDoc.save();
        } else {
            doc.channels = paperChannels;
            await doc.save();
        }
    } catch (err) {
        console.error('Failed to update paper channels:', err);
    }
}