import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";

export default defineConfig([
  {
    rules: {
      "no-console": "error",
    },
    files: ["**/*.{js,mjs,cjs}"],
    ignores: ["tests/**"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["config/**/*.js", "middleware/**/*.js", "routes/**/*.js"], // Node.js files
    languageOptions: {
      globals: {
        ...globals.node,
        // ...globals.browser, // if needed
      },
    },
  },
]);
