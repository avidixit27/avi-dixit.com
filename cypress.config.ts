import { defineConfig } from "cypress";
import viteConfig from "./vite.config.mts";

export default defineConfig({
  screenshotsFolder: "cypress/screenshots",
  video: false,
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig,
    },
    specPattern: "src/**/*.cy.tsx",
    supportFile: "cypress/support/component.ts",
  },
  e2e: {
    baseUrl: "http://127.0.0.1:4173",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
  },
});
