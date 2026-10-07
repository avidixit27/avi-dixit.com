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
const DEFAULT_CONFIG_ENV = {
  command: "serve",
  mode: "development",
  isPreview: false,
} as const;

export function isAllFeaturesDevelopment(
  command: string,
  mode: string,
  isPreview = false,
) {
  return command === "serve" && mode === "all-features" && !isPreview;
}

export default defineConfig(
  ({ command, mode, isPreview } = DEFAULT_CONFIG_ENV) => {
    const isComponentTest = process.env.PORTFOLIO_COMPONENT_TESTS === "true";
    const responsiveWidths = isComponentTest
      ? "32"
      : PORTFOLIO_RESPONSIVE_WIDTHS;
    const fallbackWidth = isComponentTest ? "32" : PORTFOLIO_FALLBACK_WIDTH;
    const avifEffort = isComponentTest ? "0" : PORTFOLIO_AVIF_EFFORT;

    return {
      define: {
        "import.meta.env.ALL_FEATURES_DEVELOPMENT": JSON.stringify(
          isAllFeaturesDevelopment(command, mode, isPreview),
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
              directives.set("w", responsiveWidths);
              if (url.searchParams.get("format") === "avif") {
                directives.set("quality", PORTFOLIO_AVIF_QUALITY);
                directives.set("effort", avifEffort);
              } else {
                directives.set("quality", PORTFOLIO_IMAGE_QUALITY);
              }
            } else if (url.searchParams.has("portfolio-fallback")) {
              directives.set("w", fallbackWidth);
              directives.set("quality", PORTFOLIO_IMAGE_QUALITY);
            }

            return directives;
          },
        }),

        cloudflare(),
      ],
    };
  },
);
