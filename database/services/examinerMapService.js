const { ExaminersMap } = require('../models');

async function upsertExaminerMap(mapData) {
    const objData = Object.fromEntries(mapData); // convert Map to plain object

    try {
        await ExaminersMap.replaceOne({}, objData, { upsert: true });
    } catch (err) {
        console.error('Failed to update examiner map:', err);
    }
}

async function loadExaminerMap() {
    try {
        const doc = await ExaminersMap.findOne({});
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

module.exports = { upsertExaminerMap, loadExaminerMap };
