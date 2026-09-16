# 2026-09-12 — Cloudflare and Sharp maintenance

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Status       | Completed                                                  |
| Base         | `main` at `bd131b7`                                        |
| Branch       | `fix/dependency-vulnerabilities`                           |
| Pull request | [#32](https://github.com/avidixit27/avi-dixit.com/pull/32) |

## Inputs reviewed

- Dependabot alert 42: high-severity `sharp <0.35.4` exposure through Miniflare's development dependency tree.
- Dependabot pull requests [#19](https://github.com/avidixit27/avi-dixit.com/pull/19), [#20](https://github.com/avidixit27/avi-dixit.com/pull/20), [#21](https://github.com/avidixit27/avi-dixit.com/pull/21), and [#22](https://github.com/avidixit27/avi-dixit.com/pull/22).
- Before the fix, the production-tree audit was clean while the complete tree contained the Sharp advisory.

## Changes

| Dependency                | Scope                   | Previous                      | Updated               | Reason and owning dependency                                                                 |
| ------------------------- | ----------------------- | ----------------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| `@cloudflare/vite-plugin` | Development, direct     | `^1.54.4`                     | `^1.54.8`             | Resolves the Cloudflare toolchain with patched Miniflare and remains aligned with Vite 8     |
| `wrangler`                | Development, direct     | `^4.129.0`                    | `^4.131.1`            | Directly invoked by preview and deploy scripts; aligns with the Vite plugin peer requirement |
| `miniflare`               | Development, transitive | `5.20260907.0-alpha`          | `5.20260911.0-alpha`  | Cloudflare-owned path that updates Sharp                                                     |
| `sharp`                   | Development, transitive | `0.35.2` plus nested `0.35.4` | deduplicated `0.35.4` | First patched version for alert 42 and one shared dependency tree                            |

## Deferred or closed updates

| Update                                         | Decision             | Evidence                                                             | Revisit when                                               |
| ---------------------------------------------- | -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| React and React DOM / Dependabot PRs 19 and 21 | Closed without merge | Not required to resolve alert 42; the repository remains on React 18 | A separately scoped React upgrade is approved and verified |
| lint-staged / Dependabot PR 20                 | Closed without merge | Not required to resolve alert 42                                     | A routine compatible maintenance run includes the update   |
| TypeScript 7.0.2 / Dependabot PR 22            | Deferred             | `typescript-eslint@8.69.0` declares TypeScript `>=4.8.4 <6.1.0`      | TypeScript ESLint declares TypeScript 7 support            |

## Security and compatibility outcome

The installed dependency tree resolves one patched `sharp@0.35.4` shared by Miniflare and `vite-imagetools`. The production dependency tree remained free of known vulnerabilities, and the development-tree Sharp advisory was resolved without peer overrides or weakened checks.

## Post-upgrade configuration audit

| Classification | Configuration                                     | Evidence and action                                                                                                                             |
| -------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Remove         | Legacy nested Sharp tree                          | The Cloudflare update lets npm deduplicate the platform-specific Sharp packages; the lockfile now owns one patched tree                         |
| Keep           | Direct `wrangler` dependency and `wrangler.jsonc` | Package scripts invoke Wrangler directly, and the config owns asset directory, SPA fallback, compatibility date, and observability              |
| Keep           | `vite.config.ts`                                  | Vite consumes it directly; it owns React, Tailwind 4, image transformation, and Cloudflare integration and is reused by Cypress component tests |
| Keep           | Separate root and Cypress TypeScript configs      | They isolate browser/application types from Cypress, Node, and Mocha globals while sharing strict compiler settings through `extends`           |
| Keep           | Package-level lint-staged configuration           | The pre-commit hook invokes lint-staged directly and the configuration contains only repository file groups and existing checks                 |
| Keep           | ESLint 9 and TypeScript 5                         | Installed lint plugins support ESLint 9, while TypeScript 7 remains outside the TypeScript ESLint peer range                                    |
| Measure first  | Removing `skipLibCheck`                           | It is unrelated to these upgrades; assess type-check cost and third-party declaration health before changing the safeguard                      |

No additional configuration file or compatibility workaround became safely removable from the merged dependency changes.

## Verification

- PR #32 passed lint, formatting, strict application and Cypress type checks, the Vitest coverage gate, Cypress component tests, production build and E2E tests, dependency review, production audit, and CodeQL.
- GitHub's Workers Build check passed after merge.

## Follow-up

Revisit TypeScript 7 only after TypeScript ESLint publishes a compatible peer range. Do not use peer overrides or remove lint coverage to accelerate that upgrade.
