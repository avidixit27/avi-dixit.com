import { defineConfig } from "cypress";
import { registerBrowserRunReporting } from "./cypress/reporting";
import viteConfig from "./vite.config";

export default defineConfig({
  video: process.env.CI === "true",
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig,
    },
    specPattern: "src/**/*.cy.tsx",
    setupNodeEvents(on) {
      registerBrowserRunReporting(on);
    },
    supportFile: "cypress/support/component.ts",
  },
  e2e: {
    baseUrl: "http://127.0.0.1:4173",
    specPattern: "cypress/e2e/**/*.cy.ts",
    setupNodeEvents(on) {
      registerBrowserRunReporting(on);
    },
    supportFile: "cypress/support/e2e.ts",
  },
});
