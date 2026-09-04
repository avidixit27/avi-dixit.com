# 004 — Modernize the frontend toolchain

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Type           | Tooling                                                    |
| Status         | Tracked in the [plan index](README.md)                     |
| Depends on     | Plans 001–003 merged into `main`                           |
| Blocks         | 005 and subsequent feature work                            |
| Planned branch | `chore/toolchain-modernization`                            |
| PR base        | `main`                                                     |
| PR             | [#14](https://github.com/avidixit27/avi-dixit.com/pull/14) |

## Outcome

The development and CI toolchain runs on mutually supported releases, installs under the documented Node runtime without engine warnings, and resolves critical/high Dependabot findings that can be fixed without changing product behavior. Later media and Motion work starts from a maintained Vite/testing baseline instead of adding dependencies to an obsolete graph.

## Prerequisites and current state

- Dependabot reports 28 alerts on `main`: 1 critical, 9 high, 14 moderate, and 4 low. They are development-scope; `npm run security:audit` reports zero production vulnerabilities.
- Direct tooling includes Vite 5, Vitest 2, Cypress 14, PostCSS 8, Tailwind 3, and ESLint 9. Maintained releases include breaking major updates, so this is a coordinated migration rather than an automatic lockfile refresh.
- Local and CI runtime is Node `22.22.2`, but `package.json` declares `>=22.22.2`, which incorrectly admits unsupported odd-numbered Node releases such as Node 23.
- React 18, React Router, application behavior, and the visual theme remain unchanged unless a tool migration requires a narrowly documented compatibility fix.
- Capture a clean `npm run check`, `npm run security:audit`, production build, and current audit report before updating packages.

## Scope

- Tighten the Node engine contract to supported Node 22 plus supported even-numbered future/LTS ranges; keep `.nvmrc`, CI, and documentation aligned.
- Upgrade Vite, its React plugin, Vitest, coverage, Cypress, PostCSS, Browserslist data, and related direct tooling as mutually compatible sets.
- Evaluate ESLint 10 against every installed React, Hooks, refresh, TypeScript, and accessibility plugin. Do not force an invalid peer graph; retain the newest compatible ESLint major only when the blocker and follow-up are recorded.
- Recreate the lockfile through normal package resolution, inspect every major migration, and remove dependencies made obsolete by upgrades.
- Migrate configuration only where required while preserving strict TypeScript, lint, accessibility, component, E2E, hook, and CI behavior.
- Decide whether Tailwind 4 belongs here or in Plan 006’s visual-token migration before editing Tailwind configuration; do not perform the upgrade twice.
- Resolve all safely fixable critical/high development advisories and retain production audit enforcement.

## Non-goals

- Do not install Motion, optimize images, redesign pages, migrate React, add features, or relax checks.
- Do not use `npm audit fix --force`, unsupported peer overrides, or arbitrary dependency resolutions.
- Do not replace ESLint, Cypress, Vitest, Vite, or Tailwind with duplicate toolchains.
- Do not call a transitive advisory harmless without recording reachability, execution context, available fixes, and review date.

## Deliverables

- Supported runtime/engine declaration and refreshed lockfile.
- Maintained compatible versions of the build, test, lint, and CSS toolchain.
- Required configuration migrations with unchanged observable application behavior.
- Updated CI and contributor documentation where commands or versions change.
- Before/after audit and build/test evidence, with explicit accepted blockers if any remain.

## Implementation plan

1. Record installed versions, dependency paths, audit findings, deprecations, peer requirements, and the clean baseline. Group findings by direct owner instead of upgrading transitive packages blindly.
2. Tighten the Node engine declaration and verify installs under Node `22.22.2`. Confirm unsupported Node 23 produces a clear engine mismatch instead of appearing supported by the root manifest.
3. Upgrade Vite and its React plugin together, migrate configuration, then run typecheck, unit tests, build, and E2E before continuing.
4. Upgrade Vitest and its matching coverage package together. Preserve test discovery and meaningful coverage.
5. Upgrade Cypress and its React adapter together. Preserve Chrome component/E2E execution, screenshots, support files, and CI artifacts.
6. Upgrade PostCSS and other safely independent direct tooling. Decide Tailwind’s ticket ownership before changing its major.
7. Resolve the ESLint ecosystem to the newest mutually supported graph. Preserve React Hooks, refresh, TypeScript, dependency boundaries, and JSX accessibility coverage.
8. Run a clean `npm ci`, the full local suite, production and full audits, and both GitHub workflows. Record any remaining advisory/deprecation with its owner and follow-up.

## Acceptance criteria

- `npm ci` under Node `22.22.2` produces no `EBADENGINE` warning.
- The root engine range no longer claims support for Node 23.
- Vite, Vitest/coverage, Cypress, and their adapters are on mutually supported maintained releases.
- No production vulnerability at moderate or higher severity exists.
- No fixable critical or high development advisory remains. The goal is a zero-vulnerability full audit; any exception is specific, justified, and linked to an upstream blocker.
- Lint, formatting, strict types, unit tests, component tests, E2E tests, pre-commit behavior, CI artifacts, dependency review, and CodeQL remain effective.
- Visual output and user-facing behavior remain unchanged apart from a required compatibility correction protected by regression tests.

## Verification

- `npm ci`
- `npm run check`
- `npm run test:unit:coverage`
- `npm run security:audit`
- `npm audit`
- `npm run build`
- Confirm both frontend and security GitHub Actions workflows pass from a clean checkout.
- Review representative desktop/mobile routes and compare build output before/after.

## Risks and recovery

| Risk                                               | Mitigation or recovery                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Several major upgrades obscure the failing owner   | Upgrade and verify one compatible tool group at a time with separate commits where useful.             |
| ESLint plugins lag ESLint core                     | Keep the newest supported core temporarily; document the peer blocker instead of forcing installation. |
| Cypress/Vitest migration changes discovery         | Verify exact collected specs and test counts before and after.                                         |
| Tailwind major changes visual output               | Assign it once to this ticket or Plan 006 and compare browser output before accepting.                 |
| Audit suggests destructive or nonsensical versions | Inspect dependency ownership and upstream releases; never apply `--force` blindly.                     |

## Definition of done

- The supported tool groups, engine contract, lockfile, configuration, audits, and regression suite satisfy the acceptance criteria.
- Frontend and security CI pass, and remaining exceptions are explicit and actionable.
- The diff contains only toolchain compatibility work and required protected fixes.
- Architecture, agent guidance, plan status, and PR links reflect the final state.

## Implementation record

Started on `chore/toolchain-modernization` from merged `main` at `aba77c6`.

- The baseline ran on Node `22.23.2`, the available supported Node 22 patch release; `.nvmrc` and CI remain pinned to `22.22.2`. `npm run check` passed 3 unit tests, 7 component tests, and 4 production E2E journeys. Focused photo-navigation coverage remained 91.66% statements. The build completed in 1.21 seconds. `npm run security:audit` found zero production vulnerabilities, while the full audit found 19 development findings: 2 critical, 10 high, 5 moderate, and 2 low.
- The engine range is `^22.22.2 || ^24.0.0`, which admits the two tested toolchain release lines and rejects odd Node 23/25 releases. Future Node release lines require an intentional compatibility update.
- Vite `8.2.2` and `@vitejs/plugin-react` `6.1.1` moved atomically with Vitest and coverage `5.0.0` because their peer ranges cannot be migrated independently. Vite's removed object-form `manualChunks` configuration became Rolldown `codeSplitting` groups while preserving the React and router chunks.
- Cypress moved from `14.5.4` to `16.0.0`; `@cypress/react` remains at its current `10.0.0` release. The component and E2E spec patterns, test counts, screenshots, real styles, and Chrome execution remain intact.
- PostCSS `8.5.28`, Autoprefixer `10.5.5`, and eslint-plugin-react `7.37.5` are explicit maintained ranges. A clean lockfile refresh also updates patched Browserslist and transitive releases.
- ESLint remains at `9.39.5`. The current `eslint-plugin-react` and `eslint-plugin-jsx-a11y` peer ranges accept ESLint 9 but reject ESLint 10, so forcing core 10 would create an invalid graph. Upgrade ESLint when both plugins publish compatible releases. This leaves an install-time deprecation notice but no audit finding.
- Tailwind 4 is assigned to Plan 006. Its CSS-first configuration and design-token migration belong with the protected visual-system change rather than being performed twice.

- A final clean `npm ci --no-audit` on Node `22.23.2` completed without `EBADENGINE`; its only warning is the recorded ESLint 9 deprecation. An offline Node `23.6.1` dry run emits `EBADENGINE` for the root project and incompatible tools, proving the manifest no longer claims Node 23 support.
- Final `npm run check` passes lint, formatting, strict application/Cypress types, 3 unit tests, 7 component tests, the Vite 8 production build, and 4 E2E journeys in Chrome 152. `npm run test:unit:coverage` passes; Vitest 5 reports 100% statement/line coverage for `photoNavigation.ts` and 20% statements across the deliberately broad configured source include.
- Final `npm audit` and `npm run security:audit` both report zero vulnerabilities. The production build completes in 0.78 seconds with explicit React/router chunks; the existing approximately 146 MB source-photo payload remains for Plan 005.
- Browser review of the built `/`, `/shop`, and `/contact` routes confirmed the expected navigation, portfolio controls, product/cart presentation, and inquiry form. Cypress separately passed the 390-by-844 mobile journey and reduced-motion rendering scenario.
- Implementation is published in [PR #14](https://github.com/avidixit27/avi-dixit.com/pull/14); final GitHub Actions evidence is recorded after the latest revision completes.
