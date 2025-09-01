const MapModel = require('../models/examinersMap');

async function upsertexaminerMap(mapData) {
    const objData = Object.fromEntries(mapData); // convert Map to plain object

    try {
        await MapModel.replaceOne({}, objData, { upsert: true });
    } catch (err) {
        console.error('Failed to update examiner map:', err);
    }
}

async function loadexaminerMap() {
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
        console.error('Failed to load examiner map:', err);
        return new Map();
    }
}

module.exports = { upsertexaminerMap, loadexaminerMap };
