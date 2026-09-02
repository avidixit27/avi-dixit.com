# 003 — Verification pipeline

Type: Tooling feature. Status, branch, and PR: [plan index](README.md). Dependency: the reviewed output of [002 — TypeScript overhaul](002-typescript-overhaul.md), including the behavioral handoff from plan 001.

## Purpose

Make frontend correctness repeatably verifiable through local commands, pre-commit hooks, and GitHub Actions. Establish the test harness and meaningful regression coverage so subsequent behavior changes can use red–green–refactor.

## Scope and approach

### Linting, formatting, and local hooks

- Configure ESLint using flat configuration, typescript-eslint, React Hooks, and JSX accessibility rules. Enforce the established dependency boundaries with appropriate maintained rules.
- Configure Prettier separately from correctness linting. Exclude dependencies, build output, generated artifacts, and historical website code from active-source checks as appropriate.
- Use Husky and lint-staged for staged-source lint and supported-text formatting checks. Fail the commit on violations; keep formatting fixes explicit through developer commands.
- Keep full type checking and browser suites outside the fast pre-commit path. CI must enforce them independently of local hooks.
- Resolve findings in a focused way. Do not disable useful rules to obtain a passing result; record any justified rule choice. Broader behavioral fixes require their own scoped work.

### Unit and component tests

- Use Vitest for pure calculations and transformations, including selection and ordering logic where such logic exists after cleanup.
- Use Cypress Component Testing with Vite for rendered React behavior. Mount with actual application styles and only the required providers.
- Colocate `*.test.ts` unit tests and `*.cy.tsx` component tests. Keep Cypress browser journeys and support files under `cypress/`.
- Configure discovery and TypeScript environments so Vitest and Cypress do not load each other's tests or globals.
- Use controlled fixtures, network responses, and clocks. Assert observable results; avoid arbitrary waits, broad implementation snapshots, and duplicating the same assertions across runners.
- Establish regression tests from plans 001 and 002. These characterize existing behavior; do not claim they were written before that implementation. Prove representative assertions detect a deliberately introduced regression, restoring the code immediately afterward.
- Once the harness works, use a failing regression test before fixing any behavior found during this plan. Resume normal TDD for future behavior changes.

### Commands

Introduce the following explicit scripts, retaining the working `typecheck` and `build` scripts from the preceding plan:

| Script | Purpose |
| --- | --- |
| `lint` | Check active source with ESLint and fail on warnings |
| `format:check` | Check formatting without changing files |
| `format` | Apply formatting explicitly |
| `typecheck` | Run strict TypeScript checks without emitting files |
| `test:unit` | Run Vitest once |
| `test:unit:watch` | Run the unit-test development loop |
| `test:component` | Run Cypress component tests headlessly |
| `test:component:open` | Open the Cypress component-test runner |
| `test:e2e` | Build and serve the production frontend, run critical Cypress journeys, and clean up the server |
| `build` | Produce the production frontend |
| `check` | Run lint, format, types, unit, component, and end-to-end checks, including the production build |

Do not add empty scripts that report success without performing checks. Pin compatible tool versions through the lockfile and document the supported Node runtime.

### GitHub Actions

- Run checks on pull requests, including PRs targeting intermediate stack branches, and on pushes to `main`.
- Use separate jobs for lint/format/types, unit tests, component tests, and production build with end-to-end verification. Independent jobs may run concurrently; browser journeys must run against the built frontend.
- Use lockfile-based installation, consistent runtimes, dependency caching, cancellation of superseded runs, and useful failure artifacts such as Cypress screenshots and logs.
- Run Cypress in headless Chrome. Do not require Cypress Cloud, production credentials, live backend services, or deployment privileges.
- Configure required checks when the workflow is available on the protected target, following the stack guidance in the index. Review existing branch rules before changing them and preserve unrelated protections.
- Keep deployment and backend verification outside this feature.

## Acceptance and verification

- All documented scripts work from the supported local environment, and `check` covers the complete frontend verification set.
- Lint, formatting, type errors, and meaningful test failures cause nonzero exits and failing CI checks.
- Pre-commit hooks reject a staged violation in a disposable verification checkout without adding synthetic commits or bad files to the working branch. Properly formatted source passes.
- Regression coverage protects the intended gallery open/navigate/close sequence, event cleanup, and route behavior captured in the previous plans.
- Component tests cover keyboard behavior, form presentation/state where implemented, and relevant callback contracts. Distinguish existing accessibility limitations from implemented guarantees.
- Representative browser journeys cover home, shop, contact, and gallery interaction with real styling and local photo assets. Include mobile viewport coverage and both normal and reduced-motion conditions where relevant.
- Tests describe actual placeholder behavior honestly; no test implies checkout, contact delivery, publishing, or authentication exists before those integrations are implemented.
- CI failure artifacts are accessible and help diagnose a broken check. Checks remain applicable to the stack's intermediate PR bases.
- The final implementation PR links verification evidence and records any remaining limitations.

## Completion

Update `AGENTS.md` and the architecture's current-state descriptions with the available commands and verification capabilities. Mark the plan completed in the index with the PR link. The temporary exception for plans 001 and 002 is then historical; normal red–green–refactor governs subsequent behavior changes.

## Implementation record

Not started. No tooling has been installed or verification pipeline executed for this plan. Add a concise outcome or link to PR evidence when implemented.
