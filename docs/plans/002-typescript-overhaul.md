# 002 — TypeScript overhaul

| Field | Value |
| --- | --- |
| Type | Refactor |
| Status | Tracked in the [plan index](README.md) |
| Depends on | Reviewed output of [001 — Code cleanup](001-code-cleanup.md) |
| Blocks | [003 — Verification pipeline](003-verification-pipeline.md) |
| Planned branch | `refactor/typescript-overhaul` |
| PR base | `react-website-overhaul` |
| PR | Not opened |

## Outcome

All active frontend source has strict TypeScript coverage and a reliable no-emit type-check command. The component ownership established by plan 001 is expressed through clear props, state, event, ref, asset, and module contracts without changing product behavior.

## Prerequisites and current state

- Plan 001 is reviewed, its ownership map and behavioral handoff are recorded, and this branch starts from its committed result.
- The plan 001 production build and browser baseline pass before migration begins.
- Reinspect `package.json`, Vite configuration, HTML entrypoint, active source extensions, dynamic imports, and image glob usage before choosing compatible TypeScript packages.

## Scope

- Add TypeScript and compatible React type packages as development dependencies, a strict `tsconfig.json`, and Vite environment/asset declarations required by the application.
- Rename active `src` JavaScript and JSX files to `.ts` and `.tsx`, migrate `vite.config.js` when needed for checked configuration, and update the HTML entrypoint and imports.
- Type real component props, callbacks, local state, refs, DOM events, timer handles, photo data, glob imports, and context only if any context remains after plan 001.
- Add `npm run typecheck` as a no-emit check and preserve `npm run build` as an independent production build.
- Update current-state documentation and provide plan 003 with commands and regression scenarios.

## Non-goals

- ESLint, Prettier, hooks, Vitest, Cypress, GitHub Actions, runtime dependency upgrades unrelated to migration, a design change, new product behavior, speculative API types, or backend contracts.

## Deliverables

- Strict TypeScript configuration and required Vite declarations.
- TypeScript/TSX active application source with working lazy imports and image discovery.
- Updated manifest and lockfile for migration-only development dependencies and the `typecheck` script.
- Passing type/build results, browser evidence, and updated current-state documentation.

## Implementation plan

1. Confirm prerequisites and select mutually compatible TypeScript and React type versions without changing application runtime versions.
2. Add strict no-emit configuration with Vite client types, bundler-aware module resolution, React JSX support, and active-source includes. Exclude build output, dependencies, and `old_website/`.
3. Migrate from the leaves inward: data/helpers, controlled presentation components, feature orchestrators, application shell, and entrypoint. Keep each coherent intermediate state buildable when practical.
4. Type actual contracts and resolve nullability and DOM access deliberately. Replace custom untyped DOM properties with owned refs or explicit maps rather than widening global DOM definitions.
5. Add declarations for imported SVG/JPEG assets and validate the eager photo glob's module shape. Avoid assertions unless an invariant is checked and explained.
6. Add and run `typecheck`, then run the production build and repeat plan 001 browser scenarios.
7. Update documentation and the plan 003 handoff with any type-system findings that deserve runtime or regression tests.

Avoid blanket `any`, unchecked assertions, and suppression comments used merely to silence errors. A narrow assertion must reflect a verified invariant and be explained. Do not introduce generic frameworks, speculative API models, or backend types.

## Acceptance criteria

Apply the [temporary bootstrap verification exception](README.md#temporary-verification-exception-plans-001-and-002-only).

- Active frontend source is migrated, with strict checking covering its real component and module boundaries.
- `npm run typecheck` and `npm run build` pass independently.
- Component props and callbacks reject incompatible values; nullable gallery selection and refs are handled explicitly.
- SVG/JPEG imports and image discovery work in the built application.
- Before/after browser checks cover home, shop, contact, slideshow, gallery selection/navigation/closing, header visibility, and scrolling using the outcomes recorded in plan 001.
- Migration-related corrections are explained. Missing automated test and lint infrastructure is reported accurately.
- Changes remain focused on typing and necessary compatibility adjustments, with no incidental dependency or styling overhaul.

## Verification

- Run `npm run typecheck` after each coherent migration batch and once more from the final clean working tree.
- Run `npm run build` before migration and after changes to configuration, entrypoints, lazy imports, or assets, then run it once more on the completed migration.
- Run `npm run dev` and repeat the plan 001 browser scenarios for routes, hero rotation, gallery selection/navigation/closing, header visibility, and scrolling at desktop and mobile sizes.
- Inspect the built application for real SVG/JPEG rendering and image-glob behavior; a passing type check alone does not verify runtime asset resolution.
- Run `git diff --check` and review the final diff for residual active `.js`/`.jsx` files, broad assertions, suppressions, accidental runtime upgrades, and unrelated behavior or styling changes.
- Report linting and automated tests as unavailable until plan 003 configures them; do not describe the bootstrap verification exception as TDD.

## Risks and recovery

| Risk | Mitigation or recovery |
| --- | --- |
| Migration hides uncertainty behind `any` or assertions | Type leaf contracts first, prefer `unknown` plus narrowing for external shapes, and review every assertion or suppression. |
| Vite asset or glob declarations compile but fail at runtime | Verify real `.JPG`/SVG imports in both production build and browser scenarios. |
| A mass rename obscures behavior changes | Migrate in ownership-based batches and keep semantic corrections separate and documented. |
| Type packages force an unintended runtime upgrade | Select compatible types for the installed runtime or pause for an explicit dependency decision. |

## Definition of done

- All active frontend source is TypeScript/TSX and meets the acceptance criteria under strict checking.
- `npm run typecheck` and `npm run build` pass independently, with browser evidence recorded.
- The diff contains migration dependencies, configuration, source typing, and necessary documentation only.
- Routine `any`, unexplained assertions, suppressions, speculative API models, and generated abstractions are absent.
- Current command and architecture documentation reflects TypeScript as implemented.
- The PR targets `codex/code-cleanup`; its link and final status are recorded in the index, and plan 003 has the completed handoff.

## Handoff

Update `AGENTS.md` and the current-state architecture description so TypeScript and `typecheck` are no longer described as unavailable. Record commands, browser observations, and new regression scenarios in the implementation PR for plan 003. Update the index with status and PR information.

## Implementation record

Started on 2026-09-03 from merged Plan 001 commit `8d91640` on branch `refactor/typescript-overhaul`. The pre-migration production build and Plan 001 browser baseline passed.

### Outcome

- Added TypeScript 5.9 and React 18 type packages as development dependencies, a strict no-emit `tsconfig.json`, Vite client and uppercase-JPG declarations, and `npm run typecheck`.
- Migrated every active source module to `.ts` or `.tsx`, the application entrypoint to `main.tsx`, and the Vite configuration to the checked ESM file `vite.config.mts`. The ESM configuration also removes the prior Vite CJS Node API deprecation warning.
- Added owner-local contracts for navigation and product catalogs, photo records and direction, component props and callbacks, cart state, nullable selections, DOM refs, browser events, timers, observers, asset modules, and the eager image glob.
- Catalogs use `as const satisfies` to preserve literal values while checking durable interfaces. No `any`, suppression comments, broad global declarations, or unchecked runtime assertions were introduced.

### Verification evidence

- `npm run typecheck` passes with strict checking, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, unused-code checks, implicit-return checks, isolated modules, verbatim module syntax, and consistent file casing enabled.
- `npm run build` passes independently. The build resolves the lazy feature imports, SVG logo, and all twelve uppercase-JPG portfolio assets.
- Desktop and 390 × 844 mobile browser checks passed for direct and client-side home, shop, and contact routes; all 21 rendered images loaded in the final clean desktop session; and the browser console contained no warnings or errors.
- Hero rotation, hero and grid gallery entry, previous/next controls, keyboard navigation, Escape and close cleanup, the existing landscape-only sequence, cart totals, navigation, scrolling, and the single custom scrollbar preserved Plan 001 behavior.
- `git diff --check` passes and no active `.js` or `.jsx` source remains. `npm run lint` still stops at the pre-existing missing ESLint configuration, and no automated test pass is claimed under the temporary bootstrap exception.

### Remaining limitations and handoff

- Large bundled photographs, browser-side orientation discovery, incomplete gallery focus management, placeholder commerce, and the contact form without submission remain unchanged. The build still reports stale Browserslist data.
- The dependency install reports 20 audit findings in the current dependency tree. No unrelated runtime or tooling upgrades were made to address them in this migration.
- Plan 003 should retain `npm run typecheck`, configure linting for `.ts` and `.tsx`, and automate the Plan 001 browser scenarios plus the pure `getAdjacentPhotoIndex` behavior. It should keep Vitest and Cypress type environments isolated from the application configuration.
- Implementation is complete locally. Record the PR link and final index status after the branch is published.
