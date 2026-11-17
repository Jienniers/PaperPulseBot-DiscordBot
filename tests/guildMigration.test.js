import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createMigrationOperations,
    extractGuildData,
} from '../utils/database/stateDatabaseSync.js';

test('extracts guild data from the legacy state document', () => {
    const guilds = {
        '12345678901234567': {
            categoryId: '98765432109876543',
            sessions: { '11111111111111111': { examinerId: '22222222222222222' } },
        },
    };

    assert.deepEqual(extractGuildData({ _id: 'global', state: { guilds } }), guilds);
});

test('extracts guild data from a global guilds collection document', () => {
    const guilds = { '12345678901234567': { sessions: {} } };

    assert.deepEqual(extractGuildData({ _id: 'global', guilds }), guilds);
});

test('ignores missing or malformed legacy guild data', () => {
    assert.deepEqual(extractGuildData(null), {});
    assert.deepEqual(extractGuildData({ state: { guilds: [] } }), {});
});

test('creates per-guild upserts with string document IDs and keeps every session', () => {
    const operations = createMigrationOperations(
        {
            '12345678901234567': {
                categoryId: '98765432109876543',
                sessions: { legacyPaper: { candidates: { candidate: { marks: '70/100' } } } },
            },
        },
        {
            '12345678901234567': {
                categoryId: 'new-category',
                sessions: { currentPaper: { candidates: { other: { verified: true } } } },
            },
        },
    );

    assert.deepEqual(operations, [
        {
            replaceOne: {
                filter: { _id: '12345678901234567' },
                replacement: {
                    _id: '12345678901234567',
                    categoryId: 'new-category',
                    sessions: {
                        legacyPaper: { candidates: { candidate: { marks: '70/100' } } },
                        currentPaper: { candidates: { other: { verified: true } } },
                    },
                },
                upsert: true,
            },
        },
    ]);
});
