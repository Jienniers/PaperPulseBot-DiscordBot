const MapModel = require('./models/candidateSessionMap');

async function upsertCandidateSessionMap(mapData) {
    const objData = Object.fromEntries(mapData); // convert Map to plain object

    try {
        await MapModel.replaceOne({}, objData, { upsert: true });
    } catch (err) {
        console.error('Failed to update candidate session map:', err);
    }
}


async function loadCandidateSessionMap() {
    try {
        const doc = await MapModel.findOne({});
        if (!doc) return new Map(); // empty Map if no document

        // Convert document to Map
        doc.toObject()
        const map = new Map(Object.entries(doc.toObject()));

        return map;
    } catch (err) {
        console.error('Failed to load candidate session map:', err);
        return new Map();
    }
}

module.exports = {
    upsertCandidateSessionMap,
    loadCandidateSessionMap
};
