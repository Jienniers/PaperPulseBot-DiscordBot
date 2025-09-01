require('dotenv').config();

let {
  paperChannels,
  paperTimeMinsMap,
  examinersMap,
  paperRunningMap,
  candidateSessionsMap,
} = require('../data/state');

const { updatePaperChannelsInDB, getPaperChannels } = require('../database/paperChannelsService');
const { upsertPaperMins, loadPaperTimeMins } = require('../database/paperTimeMinsService');
const { upsertexaminerMap, loadexaminerMap } = require('../database/examinerMapService');
const { upsertPaperRunningMap, loadPaperRunningMap } = require('../database/paperRunningMapService');
const { upsertCandidateSessionMap, loadCandidateSessionMap } = require('../database/candidateSessionMapService');

/**
 * Load a map from DB and sync it into targetMap.
 * @param {Function} loadFn - async DB loader returning a Map
 * @param {Map} targetMap - in-memory map
 * @param {Function} transformKey - optional key transformer
 * @param {Function} transformValue - optional value transformer
 */


async function syncMapFromDB(loadFn, targetMap, transformKey = (k) => k, transformValue = (v) => v) {
  const dbMap = await loadFn();
  targetMap.clear();
  for (const [key, value] of dbMap) {
    targetMap.set(transformKey(key), transformValue(value));
  }
  return targetMap;
}

/**
 * Load an array from DB and sync it into targetArray.
 * @param {Function} loadFn - async DB loader returning an array
 * @param {Array} targetArray - in-memory array
 */
async function syncArrayFromDB(loadFn, targetArray) {
  const dbArray = await loadFn();
  targetArray.length = 0;
  targetArray.push(...dbArray);
  return targetArray;
}

/**
 * Initialize all in-memory state from the database.
 */
async function initializeState(client) {
  await syncArrayFromDB(getPaperChannels, paperChannels);
  await syncMapFromDB(loadCandidateSessionMap, candidateSessionsMap);
  await syncMapFromDB(loadexaminerMap, examinersMap, (k) => String(k), (v) => String(v));
  await syncMapFromDB(loadPaperRunningMap, paperRunningMap);
  await syncMapFromDB(loadPaperTimeMins, paperTimeMinsMap);

  updateDatabaseWithServer(client);

  logCurrentState();

  // Periodically sync in-memory state back to DB
  setInterval(syncStateToDB, 3000);
}

/**
 * Log current state for debugging.
 */
function logCurrentState() {
  console.log("Paper Channels:", paperChannels);
  console.log("Candidate Sessions:", [...candidateSessionsMap]);
  console.log("Examiners:", [...examinersMap]);
  console.log("Paper Running:", [...paperRunningMap]);
  console.log("Paper Time Mins:", [...paperTimeMinsMap]);
}

/**
 * Write in-memory state back into the database.
 */
function syncStateToDB() {
  updatePaperChannelsInDB(paperChannels);
  upsertPaperMins(paperTimeMinsMap);
  upsertexaminerMap(examinersMap);
  upsertPaperRunningMap(paperRunningMap);
  upsertCandidateSessionMap(candidateSessionsMap);
}

function updateDatabaseWithServer(client) {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return console.log("Guild not found!");
  const channelIDs = guild.channels.cache.map(ch => ch.id);

  //PaperChannels Update Bellow

  const PaperChannelsbefore = paperChannels.length;

  paperChannels = paperChannels.filter(id => channelIDs.includes(id));

  const PaperChannelsafter = paperChannels.length;
  if (PaperChannelsbefore !== PaperChannelsafter) {
    updatePaperChannelsInDB(paperChannels);
  }

  //PaperTimeMinsMap Update Bellow
  const PaperTimeMinsMapbefore = paperTimeMinsMap.length;

  for (const key of paperTimeMinsMap.keys()) {
    if (!channelIDs.includes(key)) {
      paperTimeMinsMap.delete(key);
    }
  }

  const PaperTimeMinsMapafter = paperTimeMinsMap.length;
  if (PaperTimeMinsMapbefore !== PaperTimeMinsMapafter) {
    upsertPaperMins(paperChannels);
  }

  //examainerMap Update Bellow
  const examainerMapbefore = examinersMap.length;

  for (const key of examinersMap.keys()) {
    if (!channelIDs.includes(key)) {
      examinersMap.delete(key);
    }
  }

  const examainerMapafter = examinersMap.length;
  if (examainerMapbefore !== examainerMapafter) {
    upsertexaminerMap(examinersMap);
  }

  //PaperRunningMap Update Bellow
  const PaperRunningMapbefore = paperRunningMap.length;

  for (const key of paperRunningMap.keys()) {
    if (!channelIDs.includes(key)) {
      paperRunningMap.delete(key);
    }
  }

  const PaperRunningMapafter = paperRunningMap.length;
  if (PaperRunningMapbefore !== PaperRunningMapafter) {
    upsertPaperRunningMap(paperRunningMap);
  }

}

module.exports = {
  initializeState,
  syncMapFromDB,
  syncArrayFromDB,
};
