import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,     // ✅ Includes process, __dirname, etc.
        ...globals.es2021,   // ✅ ES2021 globals like Promise, etc.
      },
    },
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    ignores: ["node_modules", ".env", "eslint.config.mjs"],
  },
]);
