import { state } from '../../data/state.js';
import Guild from '../../database/models/Guild.js';

export async function loadStateFromDB() {
    const documents = await Guild.find().lean();

    state.guilds = Object.fromEntries(documents.map(({ _id, ...guildData }) => [_id, guildData]));
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
