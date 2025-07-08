const fs = require('fs');
const path = require('path');

const configFilePath = path.resolve(__dirname, '..', 'config.json');

function getConfig() {
    if (!fs.existsSync(configFilePath)) {
        console.error(
            '❌ config.json not found. Please copy it from examples/config.json and fill it.',
        );
        process.exit(1);
    }
    const raw = fs.readFileSync(configFilePath, 'utf-8');
    return JSON.parse(raw);
}

module.exports = { getConfig };
