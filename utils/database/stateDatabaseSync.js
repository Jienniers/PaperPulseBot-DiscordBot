import { state } from '../../data/state.js';
import BotState from '../../database/models/BotState.js';
import Guild from '../../database/models/Guild.js';

export function extractGuildData(document) {
    const guildData = document?.state?.guilds ?? document?.guilds;
    return guildData && typeof guildData === 'object' && !Array.isArray(guildData) ? guildData : {};
}

function mergeGuildData(legacyData, existingData = {}) {
    const merged = { ...legacyData };

    for (const [key, value] of Object.entries(existingData)) {
        if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            merged[key] &&
            typeof merged[key] === 'object' &&
            !Array.isArray(merged[key])
        ) {
            merged[key] = mergeGuildData(merged[key], value);
        } else {
            merged[key] = value;
        }
    }

    return merged;
}

export function createMigrationOperations(guildData, existingGuilds = {}) {
    return Object.entries(guildData).map(([guildId, data]) => ({
        replaceOne: {
            filter: { _id: String(guildId) },
            replacement: {
                ...mergeGuildData(data, existingGuilds[guildId]),
                _id: String(guildId),
            },
            upsert: true,
        },
    }));
}

/** Migrate the previous global state document after guild documents are safely upserted. */
export async function migrateLegacyGuildData() {
    const legacyDocs = await Promise.all([
        BotState.findById('global').lean(),
        Guild.collection.findOne({ _id: 'global' }),
    ]);
    const guildData = Object.assign({}, ...legacyDocs.map(extractGuildData));
    const entries = Object.entries(guildData).filter(
        ([guildId, value]) =>
            guildId && value && typeof value === 'object' && !Array.isArray(value),
    );

    if (entries.length) {
        const existingDocuments = await Guild.find({
            _id: { $in: entries.map(([guildId]) => guildId) },
        }).lean();
        const existingGuilds = Object.fromEntries(
            existingDocuments.map(({ _id, ...data }) => [_id, data]),
        );

        await Guild.bulkWrite(
            createMigrationOperations(Object.fromEntries(entries), existingGuilds),
            { ordered: true },
        );
    }

    // Delete legacy sources only after every destination write has succeeded.
    if (legacyDocs[0]) await BotState.deleteOne({ _id: 'global' });
    if (legacyDocs[1]) await Guild.collection.deleteOne({ _id: 'global' });

    return Object.fromEntries(entries);
}

export async function loadStateFromDB() {
    const migratedGuilds = await migrateLegacyGuildData();
    const documents = await Guild.find({ _id: { $ne: 'global' } }).lean();

    state.guilds = Object.fromEntries(documents.map(({ _id, ...guildData }) => [_id, guildData]));

    for (const [guildId, guildData] of Object.entries(migratedGuilds)) {
        state.guilds[guildId] ??= guildData;
    }
}

export async function saveStateToDB() {
    const entries = Object.entries(state.guilds);
    const guildIds = entries.map(([guildId]) => guildId);

    if (entries.length) {
        await Guild.bulkWrite(
            entries.map(([guildId, guildData]) => ({
                replaceOne: {
                    filter: { _id: guildId },
                    replacement: { _id: guildId, ...guildData },
                    upsert: true,
                },
            })),
            { ordered: true },
        );
    }

    await Guild.deleteMany({ _id: { $nin: guildIds } });
}

export function startsync() {
    setInterval(() => {
        saveStateToDB().catch(console.error);
    }, 3000); // sync interval to MongoDB
}
