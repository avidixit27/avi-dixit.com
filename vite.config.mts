import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.JPG"],
  build: {
    sourcemap: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules\/react(?:-dom)?\// },
            { name: "router", test: /node_modules\/react-router(?:-dom)?\// },
          ],
        },
      },
    },
  },
});
