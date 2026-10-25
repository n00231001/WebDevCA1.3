import js from "@eslint/js";
import globals from "globals";

// ESLint finds likely mistakes, e.g. unused variables or misspelled names.
// Formatting (spaces, quotes, line length) is left to Prettier.
// Run it with: npm run lint

export default [
  js.configs.recommended,
  {
    languageOptions: {
      // Lets ESLint know about Node's built-in names, e.g. process and console
      globals: globals.node,
    },
    rules: {
      // Unused function arguments are fine if they start with _, e.g. (_req, res)
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: ["uploads/"],
  },
];
