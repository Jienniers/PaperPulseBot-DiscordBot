const PaperTimeMinsModel = require('./models/paperTimeMins');

async function upsertPaperMins(mapData) {
    const objData = Object.fromEntries(mapData); // convert Map to plain object

    try {
        await PaperTimeMinsModel.replaceOne({}, objData, { upsert: true });
    } catch (err) {
        console.error('Failed to update paper mins:', err);
    }
}

module.exports = { upsertPaperMins };
