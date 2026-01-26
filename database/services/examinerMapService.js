import { ExaminersMap } from '../models/index.js';

export async function loadExaminerMap() {
    try {
        const doc = await ExaminersMap.findOne();
        return new Map(Object.entries(doc?.data ?? {}));
    } catch (err) {
        console.error('[ExaminersMap] load failed:', err);
        return new Map();
    }
}

export async function upsertExaminerMap(map) {
    try {
        await ExaminersMap.updateOne(
            {},
            { $set: { data: Object.fromEntries(map) } },
            { upsert: true },
        );
    } catch (err) {
        console.error('[ExaminersMap] upsert failed:', err);
    }
}
