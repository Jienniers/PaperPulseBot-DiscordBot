import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';
import prettierConfig from './.prettierrc' assert { type: 'json' }; // ✅ import Prettier rules

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
            'prettier/prettier': ['error', prettierConfig], // ✅ use your Prettier config here
        },
    },
    {
        ignores: ['node_modules', '.env', 'eslint.config.mjs'],
    },
]);
