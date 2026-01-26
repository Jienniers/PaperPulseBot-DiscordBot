import { PaperTimeMins } from '../models/index.js';

export async function loadPaperTimeMins() {
    try {
        const doc = await PaperTimeMins.findOne();
        return new Map(Object.entries(doc?.data ?? {}));
    } catch (err) {
        console.error('[PaperTimeMins] load failed:', err);
        return new Map();
    }
}

export async function upsertPaperTimeMins(map) {
    try {
        await PaperTimeMins.updateOne(
            {},
            { $set: { data: Object.fromEntries(map) } },
            { upsert: true },
        );
    } catch (err) {
        console.error('[PaperTimeMins] upsert failed:', err);
    }
}
