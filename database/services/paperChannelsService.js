import { PaperChannels } from '../models/index.js';

/**
 * Retrieves the paper channels from the database.
 * Creates a new document if none exists.
 */
export async function getPaperChannels() {
    try {
        let doc = await PaperChannels.findOne();
        if (!doc) {
            doc = new PaperChannels();
            await doc.save();
        }
        return doc.channels;
    } catch (err) {
        console.error('Failed to get paper channels:', err);
        return [];
    }
}

export async function setPaperChannels(channels) {
    await updatePaperChannelsInDB(channels);
}

/**
 * Updates the paper channels document in the database.
 * Creates a new document if none exists.
 */
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
