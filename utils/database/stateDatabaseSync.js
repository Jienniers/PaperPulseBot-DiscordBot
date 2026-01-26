// =====================
// Imports
// =====================

// State maps
import {
    paperChannels,
    paperTimeMinsMap,
    examinersMap,
    paperRunningMap,
    candidateSessionsMap,
} from '../../data/state.js';

// Service functions
import {
    updatePaperChannelsInDB,
    getPaperChannels,
} from '../../database/services/paperChannelsService.js';

import {
    upsertCandidateSessionMap,
    loadCandidateSessionMap,
} from '../../database/services/candidateSessionMapService.js';

import { upsertExaminerMap, loadExaminerMap } from '../../database/services/examinerMapService.js';

import {
    upsertPaperRunningMap,
    loadPaperRunningMap,
} from '../../database/services/paperRunningMapService.js';

import {
    upsertPaperTimeMins,
    loadPaperTimeMins,
} from '../../database/services/paperTimeMinsService.js';

// =====================
// Main functions
// =====================

export async function syncMapFromDB(
    loadFn,
    targetMap,
    transformKey = (k) => k,
    transformValue = (v) => v,
) {
    const dbMap = await loadFn();
    targetMap.clear();
    for (const [key, value] of dbMap) {
        targetMap.set(transformKey(key), transformValue(value));
    }
    return targetMap;
}

export async function syncArrayFromDB(loadFn, targetArray) {
    const dbArray = await loadFn();
    targetArray.length = 0;
    targetArray.push(...dbArray);
    return targetArray;
}

export async function initializeAndSyncState(client) {
    await syncArrayFromDB(getPaperChannels, paperChannels);
    await syncMapFromDB(loadCandidateSessionMap, candidateSessionsMap);
    await syncMapFromDB(
        loadExaminerMap,
        examinersMap,
        (k) => String(k),
        (v) => String(v),
    );
    await syncMapFromDB(loadPaperRunningMap, paperRunningMap);
    await syncMapFromDB(loadPaperTimeMins, paperTimeMinsMap);

    await memoryCleanup().updateDatabaseWithServer(client);

    const syncInterval = setInterval(syncStateToDB, 3000);

    process.on('SIGINT', () => {
        clearInterval(syncInterval);
        console.log('Bot shutting down, sync interval cleared.');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        clearInterval(syncInterval);
        console.log('Bot shutting down, sync interval cleared.');
        process.exit(0);
    });
}

function syncStateToDB() {
    updatePaperChannelsInDB(paperChannels);
    upsertPaperTimeMins(paperTimeMinsMap);
    upsertExaminerMap(examinersMap);
    upsertPaperRunningMap(paperRunningMap);
    upsertCandidateSessionMap(candidateSessionsMap);
}

function memoryCleanup() {
    /**
     * Remove any entries from memory that no longer exist on the server, and update DB.
     */
    async function updateDatabaseWithServer(client) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) return console.log('Guild not found!');

        const serverChannelIDs = guild.channels.cache.map((ch) => ch.id);

        syncArrayWithServer(paperChannels, serverChannelIDs, updatePaperChannelsInDB);
        syncMapWithServer(paperTimeMinsMap, serverChannelIDs, upsertPaperTimeMins);
        syncMapWithServer(examinersMap, serverChannelIDs, upsertExaminerMap);
        syncMapWithServer(paperRunningMap, serverChannelIDs, upsertPaperRunningMap);
    }

    /**
     * Helper: Remove invalid array entries and optionally update DB.
     */
    function syncArrayWithServer(array, validIDs, dbUpdateFn) {
        const oldLength = array.length;
        const filtered = array.filter((id) => validIDs.includes(id));
        array.length = 0;
        array.push(...filtered);
        if (filtered.length !== oldLength) dbUpdateFn(array);
    }

    /**
     * Helper: Remove invalid Map entries and optionally update DB.
     */
    function syncMapWithServer(map, validIDs, dbUpdateFn) {
        const oldSize = map.size;
        for (const key of [...map.keys()]) {
            if (!validIDs.includes(key)) map.delete(key);
        }
        if (map.size !== oldSize) dbUpdateFn(map);
    }

    return { updateDatabaseWithServer };
}
