import 'dotenv/config';

import {
    candidateSessionsMap,
    examinersMap,
    paperChannels,
    paperTimeMinsMap,
} from '../../data/state.js';
import {
    loadCandidateSessionMap,
    upsertCandidateSessionMap,
} from '../../database/services/candidateSessionMapService.js';
import { loadExaminerMap, upsertExaminerMap } from '../../database/services/examinerMapService.js';
import {
    getPaperChannels,
    updatePaperChannelsInDB,
} from '../../database/services/paperChannelsService.js';
import {
    loadPaperTimeMins,
    upsertPaperTimeMins,
} from '../../database/services/paperTimeMinsService.js';

const SYNC_INTERVAL_MS = Number(process.env.SYNC_INTERVAL) || 3000;

/**
 * Load DB array into memory
 */
async function loadArrayFromDB(loadFn, targetArray) {
    const dbArray = await loadFn();

    targetArray.length = 0;
    targetArray.push(...dbArray);
}

/**
 * Load DB map into memory
 */
async function loadMapFromDB(loadFn, targetMap) {
    const dbMap = await loadFn();

    targetMap.clear();

    for (const [key, value] of dbMap) {
        targetMap.set(key, value);
    }
}

/**
 * Persist all in-memory state to MongoDB
 */
export async function syncStateToDB() {
    await Promise.all([
        updatePaperChannelsInDB(paperChannels),
        upsertPaperTimeMins(paperTimeMinsMap),
        upsertExaminerMap(examinersMap),
        upsertCandidateSessionMap(candidateSessionsMap),
    ]);
}

/**
 * Load all MongoDB state into memory
 */
export async function initializeAndSyncState() {
    await loadArrayFromDB(getPaperChannels, paperChannels);
    await loadMapFromDB(loadCandidateSessionMap, candidateSessionsMap);
    await loadMapFromDB(loadExaminerMap, examinersMap);
    await loadMapFromDB(loadPaperTimeMins, paperTimeMinsMap);

    const syncInterval = setInterval(() => {
        syncStateToDB().catch(console.error);
    }, SYNC_INTERVAL_MS);

    const shutdown = async (signal) => {
        console.log(`Received ${signal}, syncing final state...`);

        clearInterval(syncInterval);

        try {
            await syncStateToDB();
        } catch (err) {
            console.error('Final sync failed:', err);
        }

        process.exit(0);
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
}
