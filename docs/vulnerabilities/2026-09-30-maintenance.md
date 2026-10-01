# 2026-09-30 — Dependency maintenance

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Status       | Completed                                                  |
| Base         | `main` at `7d50d43`                                        |
| Branch       | `chore/dependency-maintenance-september`                   |
| Pull request | [#52](https://github.com/avidixit27/avi-dixit.com/pull/52) |

## Inputs reviewed

- Open Dependabot alerts: none reported by GitHub on 2026-09-30.
- Open Dependabot pull requests: #34 (`lint-staged`), #35–36 (React, React DOM, and types), #48 (production group), and #49 (development group).
- Package audit before changes: not run. The first full audit after compatible upgrades found one high-severity development-tree advisory in transitive `brace-expansion@1.1.18`; the production audit was clean.

## Changes

| Dependency                                                                    | Scope                   | Previous                      | Updated                       | Reason and owning dependency                                                                                      |
| ----------------------------------------------------------------------------- | ----------------------- | ----------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `motion`                                                                      | Production, direct      | 13.2.0                        | 13.4.6                        | Compatible current release; supersedes #48.                                                                       |
| `react-router-dom`                                                            | Production, direct      | 7.18.3                        | 7.18.4                        | Compatible patch; supersedes #48.                                                                                 |
| `@cloudflare/vite-plugin`, `wrangler`                                         | Development, direct     | 1.54.8, 4.131.1               | 1.62.3, 4.145.0               | Coupled Cloudflare tooling updates from #49.                                                                      |
| `vite`, `cypress`                                                             | Development, direct     | 8.2.2, 16.0.0                 | 8.3.1, 16.1.1                 | Build and browser-test updates from #49.                                                                          |
| `vitest`, `@vitest/coverage-v8`                                               | Development, direct     | 5.0.0                         | 5.0.3                         | Keep the test runner and coverage provider aligned; supersedes #49.                                               |
| `@types/node`, `eslint-plugin-react-refresh`, `prettier`, `typescript-eslint` | Development, direct     | 22.20.1, 0.5.6, 3.9.6, 8.69.0 | 22.20.4, 0.5.7, 3.9.9, 8.71.0 | Compatible updates from #49.                                                                                      |
| `lint-staged`                                                                 | Development, direct     | 16.4.0                        | 17.6.0                        | Current Node 22-compatible release; supersedes #34.                                                               |
| `brace-expansion`                                                             | Development, transitive | 1.1.18                        | 1.1.21                        | `npm audit fix --package-lock-only` repairs the advisory through ESLint's `minimatch@3` tree without an override. |

The direct package ranges selected current compatible releases, so some versions are newer than their Dependabot snapshots. `npm install` and `npm audit fix --package-lock-only` generated the lockfile; it was not edited manually.

## Deferred or closed updates

| Update                                                    | Decision                    | Evidence                                                                                                      | Revisit when                                                                                                                             |
| --------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| #35–36: React, React DOM, and their type packages 18 → 19 | Deferred; bot PRs left open | Coupled runtime and type major upgrade; this maintenance branch retains React 18.3.1 and matching 18.x types. | A separately approved React 19 migration can verify Motion, Cypress component mounting, accessibility, and production journeys together. |

## Security and compatibility outcome

The full development-tree audit and production audit both report zero vulnerabilities after `brace-expansion@1.1.21`. The installed tree resolves without peer-dependency flags or overrides. React remains on major version 18, while Node remains 22.22.2 per `.nvmrc`.

## Post-upgrade configuration audit

| Classification | Configuration                                                 | Evidence and action                                                                                                                   |
| -------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Keep           | `vite.config.ts` and `wrangler.jsonc`                         | Vite still owns responsive photo generation and Cloudflare production output; the updated toolchain builds and passes production E2E. |
| Keep           | `cypress.config.ts` and `scripts/run-cypress-with-report.mjs` | Cypress 16.1.1 completes component and E2E suites with nonzero machine-readable reports; neither setting duplicates the other.        |
| Keep           | `vitest.config.ts`                                            | Vitest 5.0.3 and the matching V8 provider pass the existing 90% coverage gate.                                                        |
| Keep           | Manifest-owned `lint-staged` and `.husky/pre-commit`          | Staged-file rules still implement the fast local hook; the commit will exercise the updated command.                                  |

No removal or simplification was justified by the versions reviewed.

## Verification

- `npm ci` — passed on Node 22.22.2.
- `npm audit --audit-level=moderate` — zero vulnerabilities after the transitive repair.
- `npm run security:audit` — zero production vulnerabilities.
- `npm run lint`, `npm run format:check`, `npm run typecheck` — passed.
- `npm run test:unit` — 48 tests passed; `npm run test:unit:coverage` — 48 tests passed with all four global thresholds above 90%.
- `npm run test:component` — 38 tests across 10 specs passed with a completion report. The initial launch after the Cypress upgrade ended before a report was written; the completed rerun is the verified result.
- `npm run build` and `npm run test:e2e` — passed; E2E completed 13 tests with a completion report.
- `git diff --check` — passed before the record was added.
- GitHub PR checks: all passed for the dependency update at `c2172a6`.

## Follow-up

Review React 19 and matching type packages in a separately approved migration. Leave #35–36 open until that decision; #34, #48, and #49 are superseded by this branch and can be closed after its PR merges.
