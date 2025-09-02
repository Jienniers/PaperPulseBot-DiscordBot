function createMapService(Model, serviceName) {
    function docToMap(doc) {
        if (!doc) return new Map();
        const { _id, __v, ...rest } = doc.toObject();
        return new Map(Object.entries(rest));
    }

    async function upsert(mapData) {
        try {
            const objData = Object.fromEntries(mapData);
            await Model.replaceOne({}, objData, { upsert: true });
        } catch (err) {
            console.error(`[${serviceName}] upsert failed:`, err);
        }
    }

    async function load() {
        try {
            const doc = await Model.findOne({});
            if (!doc) return new Map();
            return docToMap(doc);
        } catch (err) {
            console.error(`[${serviceName}] load failed:`, err);
            return new Map();
        }
    }

    const serviceKey = serviceName.replace(/Service$/, '');
    return {
        [`upsert${serviceKey}`]: upsert,
        [`load${serviceKey}`]: load,
    };
}

module.exports = { createMapService };
