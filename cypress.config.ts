import { defineConfig } from "cypress";
import { registerBrowserRunReporting } from "./cypress/reporting";
import specPatterns from "./cypress/spec-patterns.json" with { type: "json" };
import viteConfig from "./vite.config";

export default defineConfig({
  video: process.env.CI === "true",
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig,
    },
    specPattern: specPatterns.component,
    setupNodeEvents(on) {
      registerBrowserRunReporting(on);
    },
    supportFile: "cypress/support/component.ts",
  },
  e2e: {
    baseUrl: "http://127.0.0.1:4173",
    specPattern: specPatterns.e2e,
    setupNodeEvents(on) {
      registerBrowserRunReporting(on);
    },
    supportFile: "cypress/support/e2e.ts",
  },
});
