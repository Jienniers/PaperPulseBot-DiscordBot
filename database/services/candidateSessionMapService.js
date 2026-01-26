import { CandidateSessionMap } from '../models/index.js';

export async function loadCandidateSessionMap() {
    try {
        const doc = await CandidateSessionMap.findOne();
        return new Map(Object.entries(doc?.data ?? {}));
    } catch (err) {
        console.error('[CandidateSessionMap] load failed:', err);
        return new Map();
    }
}

export async function upsertCandidateSessionMap(map) {
    try {
        await CandidateSessionMap.updateOne(
            {},
            { $set: { data: Object.fromEntries(map) } },
            { upsert: true },
        );
    } catch (err) {
        console.error('[CandidateSessionMap] upsert failed:', err);
    }
}
