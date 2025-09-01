require('dotenv').config();

let {
    paperChannels,
    paperTimeMinsMap,
    examinersMap,
    paperRunningMap,
    candidateSessionsMap,
} = require('../../data/state');

const {
    updatePaperChannelsInDB,
    getPaperChannels,
} = require('../../database/services/paperChannelsService');
const {
    upsertPaperMins,
    loadPaperTimeMins,
} = require('../../database/services/paperTimeMinsService');
const {
    upsertExaminerMap,
    loadExaminerMap,
} = require('../../database/services/examinerMapService');
const {
    upsertPaperRunningMap,
    loadPaperRunningMap,
} = require('../../database/services/paperRunningMapService');
const {
    upsertCandidateSessionMap,
    loadCandidateSessionMap,
} = require('../../database/services/candidateSessionMapService');

/**
 * Sync a Map from DB into memory.
 * @param {Function} loadFn - async loader returning a Map
 * @param {Map} targetMap - in-memory Map
 * @param {Function} transformKey - optional key transformer
 * @param {Function} transformValue - optional value transformer
 */
async function syncMapFromDB(
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

/**
 * Sync an array from DB into memory.
 * @param {Function} loadFn - async loader returning an array
 * @param {Array} targetArray - in-memory array
 */
async function syncArrayFromDB(loadFn, targetArray) {
    const dbArray = await loadFn();
    targetArray.length = 0;
    targetArray.push(...dbArray);
    return targetArray;
}

/**
 * Initialize all in-memory state from DB and update invalid entries based on server.
 */
async function initializeState(client) {
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

    await updateDatabaseWithServer(client);

    const syncInterval = setInterval(syncStateToDB, 3000); // Periodic DB sync

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

/**
 * Sync in-memory state back to DB.
 */
function syncStateToDB() {
    updatePaperChannelsInDB(paperChannels);
    upsertPaperMins(paperTimeMinsMap);
    upsertExaminerMap(examinersMap);
    upsertPaperRunningMap(paperRunningMap);
    upsertCandidateSessionMap(candidateSessionsMap);
}

/**
 * Remove any entries from memory that no longer exist on the server, and update DB.
 */
async function updateDatabaseWithServer(client) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return console.log('Guild not found!');

    const serverChannelIDs = guild.channels.cache.map((ch) => ch.id);

    syncArrayWithServer(paperChannels, serverChannelIDs, updatePaperChannelsInDB);
    syncMapWithServer(paperTimeMinsMap, serverChannelIDs, upsertPaperMins);
    syncMapWithServer(examinersMap, serverChannelIDs, upsertExaminerMap);
    syncMapWithServer(paperRunningMap, serverChannelIDs, upsertPaperRunningMap);
}

/**
 * Helper: Remove invalid array entries and optionally update DB.
 */
function syncArrayWithServer(array, validIDs, dbUpdateFn) {
    const filtered = array.filter((id) => validIDs.includes(id));
    array.length = 0;
    array.push(...filtered);
    if (filtered.length !== array.length) {
        dbUpdateFn(array);
    }
}

/**
 * Helper: Remove invalid Map entries and optionally update DB.
 */
function syncMapWithServer(map, validIDs, dbUpdateFn) {
    const before = map.size;
    for (const key of [...map.keys()]) {
        if (!validIDs.includes(key)) map.delete(key);
    }
    if (map.size !== before) dbUpdateFn(map);
}

module.exports = {
    initializeState,
    syncMapFromDB,
    syncArrayFromDB,
};
