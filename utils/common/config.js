// config.js
// ✅ Loads the bot's configuration from config.json
// Exits the process if the config file is missing or invalid

// Node.js built-in modules
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.resolve('./config.json');

export default function getConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error(
            '❌ config.json not found. Please copy it from examples/config.json and fill it.'
        );
        process.exit(1);
    }

    try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    } catch (err) {
        console.error('❌ Failed to read or parse config.json:', err.message);
        process.exit(1);
    }
}
