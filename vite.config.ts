import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";

const PORTFOLIO_RESPONSIVE_WIDTHS = "480;960;1440;2160";
const PORTFOLIO_FALLBACK_WIDTH = "1440";
const PORTFOLIO_IMAGE_QUALITY = "82";
const PORTFOLIO_AVIF_QUALITY = "50";
const PORTFOLIO_AVIF_EFFORT = "4";

export function isAllFeaturesDevelopment(command: string, mode: string) {
  return command === "serve" && mode === "all-features";
}

export default defineConfig(
  ({ command, mode } = { command: "serve", mode: "development" }) => ({
    define: {
      "import.meta.env.ALL_FEATURES_DEVELOPMENT": JSON.stringify(
        isAllFeaturesDevelopment(command, mode),
      ),
    },
    plugins: [
      react(),
      tailwindcss(),

      imagetools({
        include: /\.(?:avif|gif|heif|jpe?g|png|tiff|webp)(?:\?.*)?$/i,

        defaultDirectives: (url) => {
          const directives = new URLSearchParams();

          if (url.searchParams.has("portfolio-responsive")) {
            directives.set("w", PORTFOLIO_RESPONSIVE_WIDTHS);
            if (url.searchParams.get("format") === "avif") {
              directives.set("quality", PORTFOLIO_AVIF_QUALITY);
              directives.set("effort", PORTFOLIO_AVIF_EFFORT);
            } else {
              directives.set("quality", PORTFOLIO_IMAGE_QUALITY);
            }
          } else if (url.searchParams.has("portfolio-fallback")) {
            directives.set("w", PORTFOLIO_FALLBACK_WIDTH);
            directives.set("quality", PORTFOLIO_IMAGE_QUALITY);
          }

          return directives;
        },
      }),

      cloudflare(),
    ],
  }),
);
