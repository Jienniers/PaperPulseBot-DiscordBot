import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';
import fs from 'fs';

const prettierConfig = JSON.parse(fs.readFileSync('./.prettierrc', 'utf-8')); // ✅ Safe load

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
        },
        plugins: { prettier: eslintPluginPrettier },
        extends: [js.configs.recommended, prettier],
        rules: {
            'prettier/prettier': ['error', prettierConfig], // ✅ apply Prettier rules
        },
    },
    {
        ignores: ['node_modules', '.env', 'eslint.config.mjs'],
    },
]);
