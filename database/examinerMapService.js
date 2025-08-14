const examinerMapModel = require('./models/examinersMap');

async function upsertexaminerMap(mapData) {
    const objData = Object.fromEntries(mapData); // convert Map to plain object

    try {
        await examinerMapModel.replaceOne({}, objData, { upsert: true });
    } catch (err) {
        console.error('Failed to update examiner map:', err);
    }
}

module.exports = { upsertexaminerMap };
