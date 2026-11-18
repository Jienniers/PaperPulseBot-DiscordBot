import Guild from '../../database/models/Guild.js';

/** Read one guild document when its data is needed. */
export async function getGuildData(guildId) {
    try {
        return (await Guild.findById(guildId).lean()) ?? { categoryId: null, sessions: {} };
    } catch (error) {
        console.error(`[database] Failed to read guild ${guildId}:`, error);
        throw error;
    }
}

export async function getSession(guildId, channelId) {
    try {
        const guild = await Guild.findById(guildId)
            .select({ [`sessions.${channelId}`]: 1 })
            .lean();
        return guild?.sessions?.[channelId] ?? null;
    } catch (error) {
        console.error(
            `[database] Failed to read session ${channelId} for guild ${guildId}:`,
            error,
        );
        throw error;
    }
}

export async function setGuildField(guildId, path, value) {
    return updateGuild(guildId, { $set: { [path]: value } });
}

export async function unsetGuildField(guildId, path) {
    return updateGuild(guildId, { $unset: { [path]: 1 } });
}

export async function createSession(guildId, channelId, session) {
    try {
        await Guild.updateOne(
            { _id: guildId },
            { $setOnInsert: { _id: guildId }, $set: { [`sessions.${channelId}`]: session } },
            { upsert: true },
        );
    } catch (error) {
        console.error(
            `[database] Failed to create session ${channelId} for guild ${guildId}:`,
            error,
        );
        throw error;
    }
}

export async function setCandidateField(guildId, channelId, candidateId, field, value) {
    return setGuildField(
        guildId,
        `sessions.${channelId}.candidates.${candidateId}.${field}`,
        value,
    );
}

export async function verifyCandidate(guildId, channelId, candidateId) {
    const path = `sessions.${channelId}.candidates.${candidateId}.verified`;
    try {
        const result = await Guild.updateOne(
            {
                _id: guildId,
                [`sessions.${channelId}.candidates.${candidateId}`]: { $exists: true },
                [path]: { $ne: true },
            },
            { $set: { [path]: true } },
        );
        return result.modifiedCount === 1;
    } catch (error) {
        console.error(`[database] Failed to verify candidate ${candidateId}:`, error);
        throw error;
    }
}

async function updateGuild(guildId, update) {
    try {
        await Guild.updateOne(
            { _id: guildId },
            { ...update, $setOnInsert: { _id: guildId } },
            { upsert: true },
        );
    } catch (error) {
        console.error(`[database] Failed to persist guild ${guildId}:`, error);
        throw error;
    }
}
