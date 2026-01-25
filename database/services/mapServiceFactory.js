/**
 * Factory to create a Map-based service for a Mongoose model.
 * Provides dynamic `loadX` and `upsertX` functions for the given service name.
 */
export function createMapService(Model, serviceName) {
    /**
     * Converts a Mongoose document to a JS Map.
     * Removes internal MongoDB fields `_id` and `__v`.
     */
    function docToMap(doc) {
        if (!doc) return new Map();
        const data = doc.toObject();
        delete data._id;
        delete data.__v;
        return new Map(Object.entries(data));
    }

    /**
     * Upserts the provided Map data into the collection.
     */
    async function upsert(mapData) {
        try {
            const objData = Object.fromEntries(mapData);
            await Model.replaceOne({}, objData, { upsert: true });
        } catch (err) {
            console.error(`[${serviceName}] upsert failed:`, err);
        }
    }

    /**
     * Loads the Map data from the collection.
     * Returns empty Map if no document exists or on error.
     */
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

    // Dynamic function names for external use, e.g., loadCandidatesMap, upsertCandidatesMap
    const serviceKey = serviceName.replace(/Service$/, '');
    return {
        [`upsert${serviceKey}`]: upsert,
        [`load${serviceKey}`]: load,
    };
}
