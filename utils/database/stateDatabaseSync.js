/**
 * State Database Synchronization Module
 *
 * Manages bidirectional sync between in-memory state and MongoDB.
 * - Loads state from DB on startup
 * - Periodically syncs memory → DB every 3 seconds
 * - Cleans up orphaned entries when channels are deleted
 * - Handles graceful shutdown
 */

// =====================
// Configuration
// =====================

const SYNC_INTERVAL_MS = 5000; // Sync to DB every 5 seconds
let lastSyncTime = 0; // Track last sync to avoid hammering DB
const DEBOUNCE_DELAY_MS = 1000; // Wait 1s after last change before syncing

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
// Helper Functions
// =====================

/**
 * Load a database array into a target array
 */
async function loadArrayFromDB(loadFn, targetArray) {
    const dbArray = await loadFn();
    targetArray.length = 0;
    targetArray.push(...dbArray);
}

/**
 * Load a database map into a target map
 */
async function loadMapFromDB(loadFn, targetMap) {
    const dbMap = await loadFn();
    targetMap.clear();
    for (const [key, value] of dbMap) {
        targetMap.set(key, value);
    }
}

/**
 * Remove array entries for channels that no longer exist on the server
 */
function cleanArrayWithServer(array, validIDs, dbUpdateFn) {
    const oldLength = array.length;
    const filtered = array.filter((id) => validIDs.includes(id));
    if (filtered.length !== oldLength) {
        array.length = 0;
        array.push(...filtered);
        dbUpdateFn(array);
    }
}

/**
 * Remove map entries for channels that no longer exist on the server
 */
function cleanMapWithServer(map, validIDs, dbUpdateFn) {
    const oldSize = map.size;
    for (const key of [...map.keys()]) {
        if (!validIDs.includes(key)) {
            map.delete(key);
        }
    }
    if (map.size !== oldSize) {
        dbUpdateFn(map);
    }
}

/**
 * Sync all state changes to the database
 */
function syncStateToDB() {
    updatePaperChannelsInDB(paperChannels);
    upsertPaperTimeMins(paperTimeMinsMap);
    upsertExaminerMap(examinersMap);
    upsertPaperRunningMap(paperRunningMap);
    upsertCandidateSessionMap(candidateSessionsMap);
    lastSyncTime = Date.now();
}

/**
 * Remove orphaned entries that reference deleted channels
 */
async function cleanupOrphanedData(client) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) {
        console.log('Guild not found!');
        return;
    }

    const serverChannelIDs = guild.channels.cache.map((ch) => ch.id);

    cleanArrayWithServer(paperChannels, serverChannelIDs, updatePaperChannelsInDB);
    cleanMapWithServer(paperTimeMinsMap, serverChannelIDs, upsertPaperTimeMins);
    cleanMapWithServer(examinersMap, serverChannelIDs, upsertExaminerMap);
    cleanMapWithServer(paperRunningMap, serverChannelIDs, upsertPaperRunningMap);
}

// =====================
// Main Initialization
// =====================

export async function initializeAndSyncState(client) {
    // Load all state from database into memory
    await loadArrayFromDB(getPaperChannels, paperChannels);
    await loadMapFromDB(loadCandidateSessionMap, candidateSessionsMap);
    await loadMapFromDB(loadExaminerMap, examinersMap);
    await loadMapFromDB(loadPaperRunningMap, paperRunningMap);
    await loadMapFromDB(loadPaperTimeMins, paperTimeMinsMap);

    // Clean up any orphaned data from deleted channels
    await cleanupOrphanedData(client);

    // Set up periodic sync with debouncing
    const syncInterval = setInterval(() => {
        const timeSinceLastSync = Date.now() - lastSyncTime;
        // Only sync if enough time has passed since last sync
        if (timeSinceLastSync >= DEBOUNCE_DELAY_MS) {
            syncStateToDB();
        }
    }, SYNC_INTERVAL_MS);

    // Graceful shutdown handlers
    const shutdown = (signal) => {
        clearInterval(syncInterval);
        console.log(`Received ${signal}, syncing final state to DB...`);
        syncStateToDB();
        process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}
