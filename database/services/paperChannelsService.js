import { PaperChannels } from '../models/index.js';

export async function getPaperChannels() {
    try {
        let doc = await PaperChannels.findOne();
        if (!doc) {
            doc = await PaperChannels.create({});
        }
        return doc.channels;
    } catch (err) {
        console.error('Failed to get paper channels:', err);
        return [];
    }
}

export async function updatePaperChannelsInDB(channels) {
    try {
        await PaperChannels.updateOne({}, { $set: { channels } }, { upsert: true });
    } catch (err) {
        console.error('Failed to update paper channels:', err);
    }
}
