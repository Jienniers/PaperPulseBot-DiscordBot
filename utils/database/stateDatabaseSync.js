import BotState from '../../database/models/BotState.js';
import { state } from '../../data/state.js';

export async function loadStateFromDB() {
    const doc = await BotState.findById('global');

    if (doc?.state) {
        state.guilds = doc.state.guilds || {};
    }
}

export async function saveStateToDB() {
    await BotState.findByIdAndUpdate('global', { state }, { upsert: true });
}
export function startsync() {
    setInterval(() => {
        saveStateToDB().catch(console.error);
    }, 3000);
}
