# 2026-10-09 — Dependency maintenance

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Status       | Completed                                                  |
| Base         | `main` at `02b75f1`                                        |
| Branch       | `chore/dependency-maintenance-2026-10-09`                  |
| Pull request | [#58](https://github.com/avidixit27/avi-dixit.com/pull/58) |

## Inputs reviewed

- Open Dependabot alerts: none reported by GitHub on 2026-10-09.
- Open Dependabot pull requests: #35–36 (React, React DOM, and types), #54 (`motion`), #55 (compatible development dependencies), and #56 (TypeScript).
- Package audit before changes: six development-tree findings — one moderate and five high. The production-only audit reported zero vulnerabilities.

## Changes

| Dependency                                                                              | Scope                   | Previous                                | Updated                                 | Reason and owning dependency                                                                                |
| --------------------------------------------------------------------------------------- | ----------------------- | --------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `motion`                                                                                | Production, direct      | 13.4.6                                  | 13.5.1                                  | Compatible update; supersedes #54 without taking the 14.x major.                                            |
| `@cloudflare/vite-plugin`, `wrangler`                                                   | Development, direct     | 1.62.3, 4.145.0                         | 1.63.1, 4.149.0                         | Compatible coupled Cloudflare update; removes the vulnerable `miniflare`/`sharp` toolchain reported by npm. |
| `@cypress/react`, `@types/node`, `@vitejs/plugin-react`, `globals`, `typescript-eslint` | Development, direct     | 10.0.0, 22.20.4, 6.1.1, 17.12.0, 8.71.0 | 10.0.1, 22.20.5, 6.1.2, 17.13.0, 8.71.1 | Current compatible releases; supersede the matching updates in #55.                                         |
| `vite`, `start-server-and-test`                                                         | Development, direct     | 8.3.1, 3.0.12                           | 8.3.4, 3.0.13                           | Compatible updates; the latter advances `wait-on` and repairs its transitive `joi` advisory.                |
| `miniflare`, `sharp`                                                                    | Development, transitive | 5.20260930.0-alpha, 0.35.4              | 5.20261006.1-alpha, 0.35.5              | Resolved through the owning Cloudflare packages; no override or direct transitive dependency was added.     |
| `joi`, `source-map-js`                                                                  | Development, transitive | 18.2.8, 1.2.1                           | 18.2.9, 1.2.2                           | Patched versions selected naturally by compatible owner updates and lockfile resolution.                    |

`npm install` generated both manifest and lockfile changes; the lockfile was not edited manually.

## Deferred or closed updates

| Update                                               | Decision                    | Evidence                                                                                                                               | Revisit when                                                                                                         |
| ---------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| #35–36: React, React DOM, and matching types 18 → 19 | Deferred; bot PRs left open | Coupled runtime and type major upgrade; the installed project remains on React 18.3.1 and matching 18.x types.                         | A separately approved React 19 migration can validate Motion, Cypress mounting, accessibility, and production flows. |
| #56: TypeScript 5 → 6                                | Deferred; bot PR left open  | Major compiler migration is outside routine maintenance; the repository remains on its maintained TypeScript 5.9.3 baseline.           | A separately approved compiler migration includes type, build, and Cypress validation.                               |
| ESLint and `@eslint/js` 9 → 10                       | Deferred                    | The repository's architecture explicitly retains ESLint 9 until its plugin ecosystem supports ESLint 10.                               | All required ESLint plugins publish compatible peer ranges and a scoped lint migration is approved.                  |
| `motion` 13 → 14                                     | Deferred                    | The compatible 13.5.1 update passes the full suite; a production animation-library major is unnecessary for this vulnerability repair. | A separately scoped Motion 14 migration has a concrete feature or support reason.                                    |
| `@types/node` 22 → 26                                | Deferred                    | Types remain aligned with Node 22.22.2 from `.nvmrc`; installing Node 26 types would misrepresent the supported runtime.               | The repository intentionally changes its Node runtime baseline.                                                      |

The existing Dependabot pull requests were reviewed but not closed; closing them requires a separate explicit decision after this pull request merges.

## Security and compatibility outcome

Both the complete development-tree audit and the production-only audit report zero vulnerabilities after the upgrade. The installed tree resolves without peer-dependency flags, forced resolutions, legacy peer behavior, or overrides. The six baseline findings were all in development tooling; no production dependency advisory was present.

## Post-upgrade configuration audit

| Classification | Configuration                                                 | Evidence and action                                                                                                                             |
| -------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep           | `vite.config.ts` and `wrangler.jsonc`                         | The coupled Vite/Cloudflare update builds successfully and passes production E2E; each file remains owned by its corresponding tool.            |
| Keep           | `cypress.config.ts` and `scripts/run-cypress-with-report.mjs` | Chrome completed all component and E2E specs with nonzero machine-readable reports; the wrapper still enforces a repository-specific safeguard. |
| Keep           | ESLint 9 configuration                                        | Current plugin compatibility and the documented architecture rule still require the maintained 9.x line.                                        |
| Measure first  | Motion 14 and other deferred majors                           | No vulnerability or verified product need justifies widening this maintenance change; evaluate them only in separately scoped migrations.       |

No configuration removal or simplification was justified by the versions reviewed.

## Verification

- `npm ci` on Node 22.22.2 — passed; 532 packages audited with zero vulnerabilities.
- `npm audit --json` — zero vulnerabilities after updates.
- `npm run security:audit` — zero production vulnerabilities before and after updates.
- `npm run check` — passed in full:
  - ESLint, Prettier, and both TypeScript projects passed.
  - Vitest coverage: 23 files and 67 tests passed; all global thresholds remained above 90%.
  - Cypress component: 11 specs and 66 tests passed in headless Chrome with a completion report.
  - Production build and Cypress E2E: 13 tests passed with a completion report.
  - All-features Cypress E2E: one test passed with a completion report.
- GitHub PR checks: pending.

## Follow-up

Review the deferred React, TypeScript, ESLint, Motion, and Node-type majors only as separately approved migrations. After this pull request merges, decide whether the superseded compatible Dependabot pull requests #54–55 should be closed.
