# 002 — TypeScript overhaul

Type: Refactor. Status, branch, and PR: [plan index](README.md). Dependency: the reviewed output of [001 — Code cleanup](001-code-cleanup.md).

## Purpose

Give the cleaned-up frontend explicit, checked contracts while preserving its behavior. This change establishes TypeScript and local type checking; it does not introduce the full verification toolchain.

## Scope and approach

1. Use the cleaned-up checkout as the source of truth. Keep the ownership boundaries established by plan 001.
2. Add TypeScript, compatible React type packages, and the minimal configuration needed for strict checking. Keep runtime dependency upgrades out of scope unless required and explicitly justified.
3. Migrate application source files from JavaScript/JSX to TypeScript/TSX. Update the HTML entry reference, imports, and asset declarations as needed, including Vite image imports and existing `.JPG` files. Do not migrate historical website code or unrelated tooling configuration for its own sake.
4. Type component props, callbacks, local state, refs, events, photo data, and actual module boundaries. Let inference handle straightforward local values and keep types beside their owners.
5. Resolve nullable state and DOM access deliberately. Remove reliance on custom untyped DOM properties by using owned refs or explicit structures where needed.
6. Add `npm run typecheck` as a no-emit check of the application. Verify the production build independently; transpilation alone is not proof of type correctness.

Avoid blanket `any`, unchecked assertions, and suppression comments used merely to silence errors. A narrow assertion must reflect a verified invariant and be explained. Do not introduce generic frameworks, speculative API models, or backend types.

ESLint configuration, Prettier, hooks, Vitest, Cypress, and GitHub Actions belong to plan 003. No product behavior or visual redesign is part of this migration.

## Acceptance and verification

Apply the [temporary bootstrap verification exception](README.md#temporary-verification-exception-plans-001-and-002-only).

- Active frontend source is migrated, with strict checking covering its real component and module boundaries.
- `npm run typecheck` and `npm run build` pass independently.
- Component props and callbacks reject incompatible values; nullable gallery selection and refs are handled explicitly.
- SVG/JPEG imports and image discovery work in the built application.
- Before/after browser checks cover home, shop, contact, slideshow, gallery selection/navigation/closing, header visibility, and scrolling using the outcomes recorded in plan 001.
- Migration-related corrections are explained. Missing automated test and lint infrastructure is reported accurately.
- Changes remain focused on typing and necessary compatibility adjustments, with no incidental dependency or styling overhaul.

## Handoff

Update `AGENTS.md` and the current-state architecture description so TypeScript and `typecheck` are no longer described as unavailable. Record commands, browser observations, and new regression scenarios in the implementation PR for plan 003. Update the index with status and PR information.

## Implementation record

Not started. No implementation checks have been run for this plan. Add a concise outcome or link to PR evidence when implemented.
