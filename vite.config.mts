import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";

const PORTFOLIO_RESPONSIVE_WIDTHS = "480;960;1440;2160";
const PORTFOLIO_FALLBACK_WIDTH = "1440";
const PORTFOLIO_IMAGE_QUALITY = "82";

export default defineConfig({
  plugins: [
    react(),
    imagetools({
      include: /\.(?:avif|gif|heif|jpe?g|png|tiff|webp)(?:\?.*)?$/i,
      defaultDirectives: (url) => {
        const directives = new URLSearchParams();
        if (url.searchParams.has("portfolio-responsive")) {
          directives.set("w", PORTFOLIO_RESPONSIVE_WIDTHS);
          directives.set("quality", PORTFOLIO_IMAGE_QUALITY);
        } else if (url.searchParams.has("portfolio-fallback")) {
          directives.set("w", PORTFOLIO_FALLBACK_WIDTH);
          directives.set("quality", PORTFOLIO_IMAGE_QUALITY);
        }
        return directives;
      },
    }),
  ],
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
