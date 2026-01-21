import fs from 'fs';
import path from 'path';


const configPath = path.resolve('./config.json');
if (!fs.existsSync(configPath)) {
    console.error('❌ config.json not found. Please copy it from examples/config.json and fill it.');
    process.exit(1);
}

import config from '../../config.json' with { type: 'json' };


export function getConfig() {
  return config;
}