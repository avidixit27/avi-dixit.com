# 2026-09-12 — Cloudflare, React, and lint-staged maintenance

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Status       | In progress                                                |
| Base         | `main` at `bd131b7`                                        |
| Branch       | `fix/dependency-vulnerabilities`                           |
| Pull request | [#32](https://github.com/avidixit27/avi-dixit.com/pull/32) |

## Inputs reviewed

- Dependabot alert 42: high-severity `sharp <0.35.4` exposure through Miniflare's development dependency tree.
- Dependabot pull requests [#19](https://github.com/avidixit27/avi-dixit.com/pull/19), [#20](https://github.com/avidixit27/avi-dixit.com/pull/20), [#21](https://github.com/avidixit27/avi-dixit.com/pull/21), and [#22](https://github.com/avidixit27/avi-dixit.com/pull/22).
- Before the fix, the production-tree audit was clean while the complete tree contained the Sharp advisory.

## Changes

| Dependency                | Scope                   | Previous                        | Updated               | Reason and owning dependency                                                                 |
| ------------------------- | ----------------------- | ------------------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| `@cloudflare/vite-plugin` | Development, direct     | `^1.54.4`                       | `^1.54.8`             | Resolves the Cloudflare toolchain with patched Miniflare and remains aligned with Vite 8     |
| `wrangler`                | Development, direct     | `^4.129.0`                      | `^4.131.1`            | Directly invoked by preview and deploy scripts; aligns with the Vite plugin peer requirement |
| `miniflare`               | Development, transitive | `5.20260907.0-alpha`            | `5.20260911.0-alpha`  | Cloudflare-owned path that updates Sharp                                                     |
| `sharp`                   | Development, transitive | `0.35.2` plus a nested `0.35.4` | deduplicated `0.35.4` | First patched version for alert 42 and one shared dependency tree                            |
| `react`                   | Production, direct      | `^18.2.0`                       | `^19.2.8`             | Consolidates Dependabot PR 19 with the required matching React DOM runtime                   |
| `react-dom`               | Production, direct      | `^18.2.0`                       | `^19.2.8`             | Consolidates Dependabot PR 21 with matching React runtime                                    |
| `@types/react`            | Development, direct     | `^18.3.31`                      | `^19.2.18`            | Matches React 19 and the Dependabot target                                                   |
| `@types/react-dom`        | Development, direct     | `^18.3.7`                       | `^19.2.7`             | Matches React DOM 19 and its React type peer                                                 |
| `lint-staged`             | Development, direct     | `^16.4.0`                       | `^17.5.0`             | Consolidates Dependabot PR 20; its Node 22.22.1 minimum is satisfied by `.nvmrc`             |

## Deferred or closed updates

| Update                              | Decision                 | Evidence                                                                                                                                     | Revisit when                                                                                                       |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| TypeScript 7.0.2 / Dependabot PR 22 | Deferred as incompatible | `typescript-eslint@8.69.0` declares TypeScript `>=4.8.4 <6.1.0`; forcing TypeScript 7 would move lint packages into an unsupported peer tree | `typescript-eslint` declares TypeScript 7 support and the strict type/lint suites pass without compatibility flags |
| Dependabot PRs 19–21                | Superseded by PR 32      | The compatible changes are consolidated with the security fix and tested together                                                            | Not applicable                                                                                                     |

## Security and compatibility outcome

The installed dependency tree resolves one `sharp@0.35.4` shared by Miniflare and `vite-imagetools`. React, React DOM, their type packages, Motion, React Router, and the Cypress React adapter resolve without invalid peers. TypeScript remains at the supported 5.9 line.

React 19 now receives the responsive image priority through its supported `fetchPriority` JSX property. The component tests wait for effects before asserting interval cleanup and dispatch keyboard events through the rendered document, preserving the same observable cleanup and lightbox behavior without relying on React 18 scheduling.

## Post-upgrade configuration audit

| Classification | Configuration                                     | Evidence and action                                                                                                                                                                   |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remove         | Legacy nested Sharp tree                          | The Cloudflare update lets npm deduplicate the platform-specific Sharp packages; the lockfile now owns one patched tree                                                               |
| Keep           | Direct `wrangler` dependency and `wrangler.jsonc` | Package scripts invoke Wrangler directly, and the config owns asset directory, SPA fallback, compatibility date, and observability                                                    |
| Keep           | `vite.config.ts`                                  | Vite consumes it directly; it owns React, Tailwind 4, image transformation, and Cloudflare integration and is reused by Cypress component tests                                       |
| Keep           | Separate root and Cypress TypeScript configs      | They isolate browser/application types from Cypress, Node, and Mocha globals while sharing strict compiler settings through `extends`                                                 |
| Keep           | Package-level lint-staged configuration           | The pre-commit hook invokes lint-staged directly and the configuration contains only repository file groups and existing checks                                                       |
| Keep           | ESLint 9 and TypeScript 5                         | Installed lint plugins support ESLint 9, while TypeScript 7 remains outside the TypeScript ESLint peer range                                                                          |
| Measure first  | Removing `skipLibCheck`                           | It is unrelated to these upgrades; assess type-check cost and third-party declaration health before changing the safeguard                                                            |
| Measure first  | React 19 entry bundle                             | The production entry changed from approximately 99.92 kB to 113.86 kB gzip in local builds; use production measurements before attributing user-visible cost or adding bundling rules |

No additional configuration file or compatibility workaround became safely removable from the compatible upgrades.

## Verification

- Node `22.22.2` clean install succeeds without invalid peers.
- `npm audit --audit-level=high` reports zero vulnerabilities after the Cloudflare update.
- `npm run security:audit` reports zero production vulnerabilities.
- `npm run typecheck` passes after the React 19 and lint-staged updates.
- `npm run check` passes: lint, formatting, strict application and Cypress types, 34 unit tests with 100% statements/lines/functions and 94.54% branches, 20 component tests, production build, and 13 E2E tests.

## Follow-up

Revisit TypeScript 7 only after TypeScript ESLint publishes a compatible peer range. Do not use peer overrides or remove lint coverage to accelerate that upgrade.
