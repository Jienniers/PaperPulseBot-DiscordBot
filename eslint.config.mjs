import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

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
        plugins: {
            js,
            prettier: eslintPluginPrettier, // ✅ add prettier plugin
        },
        extends: [
            js.configs.recommended,
            prettier, // ✅ disable conflicting ESLint rules
        ],
        rules: {
            'prettier/prettier': 'error', // ✅ make Prettier violations show as ESLint errors
        },
    },
    {
        ignores: ['node_modules', '.env', 'eslint.config.mjs'],
    },
]);
