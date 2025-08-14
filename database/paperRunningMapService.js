const paperRunningMapModel = require('./models/paperRunningMap');

async function upsertPaperRunningMap(mapData) {
    const objData = Object.fromEntries(mapData); // convert Map to plain object

    try {
        await paperRunningMapModel.replaceOne({}, objData, { upsert: true });
    } catch (err) {
        console.error('Failed to update paper running map:', err);
    }
}

module.exports = { upsertPaperRunningMap };
