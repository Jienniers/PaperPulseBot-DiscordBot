const MapModel = require('../models/paperRunningMap');

async function upsertPaperRunningMap(mapData) {
    const objData = Object.fromEntries(mapData); // convert Map to plain object

    try {
        await MapModel.replaceOne({}, objData, { upsert: true });
    } catch (err) {
        console.error('Failed to update paper running map:', err);
    }
}

async function loadPaperRunningMap() {
    try {
        const doc = await MapModel.findOne({});
        if (!doc) return new Map(); // empty Map if no document

        // Convert document to Map
        const obj = doc.toObject()

        delete obj._id;
        delete obj.__v;

        const map = new Map(Object.entries(obj));

        return map;
    } catch (err) {
        console.error('Failed to load paper running map:', err);
        return new Map();
    }
}

module.exports = { upsertPaperRunningMap, loadPaperRunningMap };
