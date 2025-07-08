import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
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
        plugins: { js },
        // ✅ Use the imported object directly here
        extends: [js.configs.recommended, prettier],
    },
    {
        ignores: ['node_modules', '.env', 'eslint.config.mjs'],
    },
]);
