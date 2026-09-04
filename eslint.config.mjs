import eslint from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

const sourceFiles = ["src/**/*.{ts,tsx}"];
const testFiles = ["src/**/*.test.ts", "src/**/*.cy.tsx", "cypress/**/*.ts"];

export default tseslint.config(
  {
    ignores: [
      "coverage/",
      "cypress/screenshots/",
      "cypress/videos/",
      "dist/",
      "node_modules/",
      "old_website/",
      "src/imgs/",
    ],
  },
  {
    files: ["**/*.{js,mjs}"],
    ...eslint.configs.recommended,
    languageOptions: {
      globals: globals.node,
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.{ts,tsx,mts}"],
  })),
  {
    files: sourceFiles,
    plugins: {
      "jsx-a11y": jsxA11y,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      ...reactRefresh.configs.vite.rules,
    },
  },
  {
    files: testFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
      },
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../app/*", "../features/*", "../routes/*"],
              message:
                "Shared components cannot depend on app, route, or feature internals.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/portfolio/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../inquiries/*", "../shop/*"],
              message: "Features cannot import another feature's internals.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/{inquiries,shop}/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../portfolio/*"],
              message: "Features cannot import another feature's internals.",
            },
          ],
        },
      ],
    },
  },
);
