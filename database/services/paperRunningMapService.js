import { PaperRunningMap } from '../models/index.js';

export async function loadPaperRunningMap() {
    try {
        const doc = await PaperRunningMap.findOne();
        return new Map(Object.entries(doc?.data ?? {}));
    } catch (err) {
        console.error('[PaperRunningMap] load failed:', err);
        return new Map();
    }
}

export async function upsertPaperRunningMap(map) {
    try {
        await PaperRunningMap.updateOne(
            {},
            { $set: { data: Object.fromEntries(map) } },
            { upsert: true },
        );
    } catch (err) {
        console.error('[PaperRunningMap] upsert failed:', err);
    }
}
