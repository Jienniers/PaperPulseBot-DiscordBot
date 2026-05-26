import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

import prettierConfig from './.prettierrc.json' with { type: 'json' };

export default defineConfig([
    {
        files: ['**/*.{js,mjs}'],
        languageOptions: {
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
        },
        plugins: { prettier: eslintPluginPrettier, 'simple-import-sort': simpleImportSort },
        extends: [js.configs.recommended, prettier],
        rules: {
            'prettier/prettier': ['error', prettierConfig], // ✅ apply Prettier rules
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
        },
    },
    {
        ignores: ['node_modules', '.env', 'eslint.config.mjs'],
    },
]);
