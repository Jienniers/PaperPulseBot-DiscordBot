const MapModel = require('./models/candidateSessionMap');

async function upsertCandidateSessionMap(mapData) {
    const objData = Object.fromEntries(mapData); // convert Map to plain object

    try {
        await MapModel.replaceOne({}, objData, { upsert: true });
    } catch (err) {
        console.error('Failed to update candidate session map:', err);
    }
}

module.exports = { upsertCandidateSessionMap };
