# 007 — Adopt Tailwind 4 and simplify configuration

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Type           | Refactor                                                   |
| Status         | Tracked in the [plan index](README.md)                     |
| Depends on     | 006                                                        |
| Blocks         | 008, 009, and 010                                          |
| Planned branch | `chore/tailwind4-config-simplification`                    |
| PR base        | `main`                                                     |
| PR             | [#24](https://github.com/avidixit27/avi-dixit.com/pull/24) |

## Outcome

The frontend uses Tailwind 4 through its Vite plugin and has one obvious configuration path for each build concern. Redundant PostCSS-era plumbing, unused dependencies, and settings that only restate defaults are removed while responsive media, Cloudflare deployment, verification, and intentional safeguards continue to work.

## Prerequisites and current state

- Plan 006 and PR #23 established canonical `.ts` / `.js` config names, a single Vite config, and Cloudflare deployment on merges to `main`.
- The committed `main` baseline uses Tailwind 3 through Vite-owned PostCSS with direct `postcss` and `autoprefixer` dependencies.
- The preserved dark-system working tree contains an incomplete Tailwind 4 migration. Recreate and verify this ticket from `main`; do not treat uncommitted visual changes as the migration baseline.
- `vite-imagetools` owns responsive portfolio transforms, and `@cloudflare/vite-plugin` plus Wrangler own Cloudflare build and deployment integration.
- Capture a clean production-build baseline before removing configuration. Use Node `22.22.2` from `.nvmrc`.

## Review classification

| Classification | Configuration decision                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Remove         | Delete `tailwind.config.js` after moving required tokens to Tailwind 4 CSS theme variables.                                                                        |
| Remove         | Delete the Vite PostCSS block and direct `postcss` / `autoprefixer` dependencies after the Tailwind Vite plugin produces equivalent supported output.              |
| Remove         | Delete unused `eslint-plugin-react` after confirming no project config imports it.                                                                                 |
| Remove         | Delete `.prettierrc.json` because it only restates Prettier's default `proseWrap` behavior.                                                                        |
| Remove         | Delete explicit `build.sourcemap: false`, `screenshotsFolder`, and `video: false` when they still match the installed tools' defaults.                             |
| Simplify       | Replace `npm-run-all2`, which only sequences `npm run check`, with npm's native sequential scripts and remove the dependency.                                      |
| Simplify       | Keep `vite.config.ts` focused on React, Tailwind, responsive images, Cloudflare, and only evidenced build policy.                                                  |
| Keep           | Keep `vite.config.ts`, `vitest.config.ts`, `cypress.config.ts`, `cypress/tsconfig.json`, `eslint.config.js`, and `wrangler.jsonc`; each has a distinct tool owner. |
| Keep           | Keep strict TypeScript flags, architecture import restrictions, Husky/lint-staged, security workflows, and explicit GitHub Actions jobs.                           |
| Keep           | Keep `@tailwindcss/vite`, `tailwindcss`, `vite-imagetools`, the Cloudflare plugin, and Wrangler because each owns active production behavior.                      |
| Keep           | Keep the focused `.gitignore` entries for dependencies, generated output, local environment material, Cypress artifacts, macOS files, and Wrangler state.          |
| Measure first  | Test production builds with and without `assetsInclude: ["**/*.JPG"]`; remove it only if uppercase image imports and generated responsive sources remain correct.  |
| Measure first  | Compare production chunks with and without the manual React/router Rolldown groups; retain or remove them using bundle, request, and cache evidence.               |

## Scope

- Upgrade the committed Tailwind 3 integration to Tailwind 4 using `@tailwindcss/vite` and the CSS-first entrypoint.
- Move all required Tailwind theme values into `src/index.css` using `@theme`; do not create a replacement JavaScript config.
- Apply the `Remove` and `Simplify` decisions above after verifying their assumptions against installed versions and repository references.
- Measure the two custom Vite rules before changing them and record the result.
- Preserve Cloudflare deployment, responsive-image transforms, linting, type checking, unit tests, Cypress, and security behavior.
- Update current-state documentation after the implementation is verified.

## Non-goals

- Do not introduce the dark redesign, Zen Tokyo Zoo typography, asset relocation, responsive bug fixes, new motion, or the 90% coverage gate.
- Do not upgrade unrelated packages or replace existing test frameworks.
- Do not create shared config wrappers, custom Vite plugins, composite GitHub actions, or compatibility layers.
- Do not alter image widths, quality, formats, or portfolio loading policy.

## Deliverables

- Tailwind 4 CSS-first theme and Vite plugin integration.
- Removal of `tailwind.config.js` and obsolete PostCSS/Autoprefixer machinery.
- A smaller dependency and configuration surface with a synchronized lockfile.
- Recorded measurements and decisions for uppercase-JPG handling and manual chunk groups.
- Updated architecture, plan record, and plan index.

## Implementation plan

1. Create the ticket branch from clean `main`. Record build output, representative computed styles, generated image sources, and Cloudflare dry-run behavior.
2. Add `@tailwindcss/vite`, upgrade Tailwind, replace the CSS directives with `@import "tailwindcss"`, and move the existing theme values into `@theme` without changing the visual design.
3. Remove the Tailwind JavaScript config, Vite PostCSS block, PostCSS, and Autoprefixer. Run the build and inspect representative prefixed output and responsive styles.
4. Remove each verified unused dependency or default-restating setting in the classification table. Update `npm run check` with native sequential npm scripts.
5. Build once without `assetsInclude` and once without the manual chunk groups. Retain only the settings with demonstrated value; record output sizes, requests/chunks, cache boundaries, and uppercase-JPG behavior.
6. Search for stale PostCSS, Tailwind 3, removed dependency, and removed config references. Update documentation to match the implemented state.
7. Run proportionate local verification and use pull-request CI as the complete gate.

## Acceptance criteria

- Tailwind utilities and custom theme values compile through `@tailwindcss/vite` with no JavaScript Tailwind or PostCSS configuration.
- `tailwind.config.js`, direct PostCSS/Autoprefixer dependencies, and all verified unused/default-only configuration are absent.
- No duplicate active source of truth exists for Tailwind tokens, Vite behavior, or TypeScript environments.
- Portfolio originals are not emitted directly, responsive JPEG/WebP candidates render, and uppercase `.JPG` imports work.
- Cloudflare's production build and dry-run deployment resolve the same `dist` output expected by `wrangler.jsonc`.
- Manual bundle rules and `assetsInclude` are kept only with recorded evidence; their disposition is not based on line-count reduction.
- No intentional visual or application behavior changes are introduced.

## Verification

Automated and build checks:

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test:unit
npm run test:component
npm run build
npm run test:e2e
npx wrangler deploy --dry-run
```

Manual review:

- Compare `/`, `/shop`, and `/contact` at mobile and desktop sizes before and after migration.
- Inspect generated CSS for required prefixes and confirm representative theme utilities compute identically.
- Inspect generated portfolio `srcset`, formats, and build artifacts.
- Compare chunk output with and without manual groups and record the decision.

## Risks and recovery

| Risk                                                   | Mitigation or recovery                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Tailwind migration silently changes utility output     | Establish visual parity before cleanup and restore the prior integration if parity cannot be explained. |
| Removing Autoprefixer weakens browser support          | Inspect representative compiled CSS and test supported Safari, Firefox, and Chromium behavior.          |
| Removing asset or bundle rules breaks media or caching | Run isolated before/after builds and retain the rule when evidence supports it.                         |
| Cloudflare plugin behavior differs from normal Vite    | Run Wrangler's dry-run path and let deployment CI validate the production integration.                  |
| Cleanup becomes another abstraction project            | Apply the decision table directly and reject new wrappers without a second concrete consumer.           |

## Definition of done

- Implementation and documentation satisfy every in-scope acceptance criterion.
- Relevant local checks and complete pull-request CI pass, with measurements and limitations recorded.
- The diff contains only this migration and configuration simplification.
- Architecture and agent guidance reflect the implemented configuration.
- The PR and plan index contain final status and links.

## Implementation record

Started September 9, 2026 from clean `main` after checkpointing the paused Plan 010 work on `feat/dark-visual-system`.

Tailwind now uses `@tailwindcss/vite`, `@import "tailwindcss"`, and one `@theme` block in `src/index.css`. The migration removed `tailwind.config.js`, Vite PostCSS plumbing, `postcss`, `autoprefixer`, unused `eslint-plugin-react`, `npm-run-all2`, `.prettierrc.json`, explicit default Cypress video/screenshots settings, and explicit default sourcemap configuration. `npm run check` now uses native sequential npm scripts.

Measured Vite settings were removed after validation. Without `assetsInclude`, the build still emitted responsive JPEG and WebP candidates for all portfolio photographs, emitted no uppercase original `.JPG`, and Wrangler found 107 deployable assets. Explicit React/router groups produced four initial JavaScript files totaling 61.87 kB gzip; Vite's default produced one 61.51 kB gzip application chunk. No measured performance benefit justified the extra chunk policy.

The original Tailwind 3 baseline could not build because the shared `node_modules` had already been changed by the paused Tailwind 4 work and lacked Autoprefixer. A clean Node `22.22.2` install from the final lockfile succeeded. Local verification passed: lint, format, strict application/Cypress type checks, six Vitest unit tests, twelve Cypress component tests, six Cypress E2E journeys, production build, production dependency audit, and Wrangler dry-run. Cypress required a temporary cache because the user-level Cypress cache is root-owned; no repository configuration changed for that environment issue. PR [#24](https://github.com/avidixit27/avi-dixit.com/pull/24) is open; the plan remains in progress until merge.
