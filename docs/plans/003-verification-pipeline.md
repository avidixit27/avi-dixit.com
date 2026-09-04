# 003 — Verification pipeline

| Field          | Value                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Type           | Tooling feature                                                                                                            |
| Status         | Tracked in the [plan index](README.md)                                                                                     |
| Depends on     | Reviewed output of [002 — TypeScript overhaul](002-typescript-overhaul.md), including the behavioral handoff from plan 001 |
| Blocks         | Routine feature work that relies on the full red–green–refactor workflow                                                   |
| Planned branch | `test/verification-pipeline`                                                                                               |
| PR base        | `react-website-overhaul`                                                                                                   |
| Pull request   | Not opened                                                                                                                 |

## Outcome

Make frontend correctness repeatably verifiable through local commands, pre-commit hooks, and GitHub Actions. Establish the test harness and meaningful regression coverage so subsequent behavior changes can use red–green–refactor.

## Prerequisites and current state

- Plan 002 is merged into `react-website-overhaul`. This branch was created from that merge with no unrelated working-tree changes present.
- Record the working `typecheck` and `build` commands, supported Node runtime, and behavioral handoff from plans 001 and 002 before changing tooling.
- Inspect the package manifest, lockfile, existing configuration, hooks, and `.github/` directory before adding or replacing files. Preserve compatible configuration and unrelated workflows.
- Run the available type check and production build to establish a baseline. Record pre-existing failures in this ticket before proceeding.
- Tool versions and configuration syntax must be selected from mutually compatible, maintained releases at implementation time; this planning document does not pin stale version numbers.

## Scope

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

| Script                | Purpose                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| `lint`                | Check active source with ESLint and fail on warnings                                            |
| `format:check`        | Check formatting without changing files                                                         |
| `format`              | Apply formatting explicitly                                                                     |
| `typecheck`           | Run strict TypeScript checks without emitting files                                             |
| `test:unit`           | Run Vitest once                                                                                 |
| `test:unit:watch`     | Run the unit-test development loop                                                              |
| `test:component`      | Run Cypress component tests headlessly                                                          |
| `test:component:open` | Open the Cypress component-test runner                                                          |
| `test:e2e`            | Build and serve the production frontend, run critical Cypress journeys, and clean up the server |
| `build`               | Produce the production frontend                                                                 |
| `check`               | Run lint, format, types, unit, component, and end-to-end checks, including the production build |

Do not add empty scripts that report success without performing checks. Pin compatible tool versions through the lockfile and document the supported Node runtime.

### GitHub Actions

- Run checks on pull requests, including PRs targeting intermediate stack branches, and on pushes to `main`.
- Use separate jobs for lint/format/types, unit tests, component tests, and production build with end-to-end verification. Independent jobs may run concurrently; browser journeys must run against the built frontend.
- Use lockfile-based installation, consistent runtimes, dependency caching, cancellation of superseded runs, and useful failure artifacts such as Cypress screenshots and logs.
- Run Cypress in headless Chrome. Do not require Cypress Cloud, production credentials, live backend services, or deployment privileges.
- Configure required checks when the workflow is available on the protected target and repository-setting changes are authorized. Review existing branch rules first and preserve unrelated protections.

## Non-goals

- Do not change product behavior, redesign pages, or add new application features to create convenient tests.
- Do not add deployment, hosting, backend verification, production credentials, or live service dependencies.
- Do not require Cypress Cloud or another paid test service.
- Do not weaken TypeScript, lint, accessibility, or test rules merely to make the pipeline pass.
- Do not expand a tooling finding into an unrelated refactor. Record the follow-up as a separate ticket when it falls outside this plan.

## Deliverables

- Package scripts for every command documented in this ticket and lockfile entries for all added tooling dependencies.
- ESLint flat configuration, Prettier configuration and ignores, and staged-file pre-commit hooks.
- Vitest configuration with meaningful unit regression coverage.
- Cypress component and end-to-end configuration, support files, controlled fixtures, and meaningful browser coverage.
- A GitHub Actions workflow that runs the complete verification set and retains useful Cypress failure artifacts.
- Updated contributor guidance, architecture current-state text, this ticket's implementation record, and the plan index.

## Implementation plan

1. **Establish the runtime and baseline.** Inspect existing tools and workflows, choose a supported Node runtime shared by local development and CI, install only the required compatible packages, and preserve the lockfile.
2. **Add deterministic commands.** Configure scripts for linting, formatting, type checking, unit tests, component tests, end-to-end tests, building, and the aggregate check. Confirm every script performs real work and propagates failures.
3. **Configure static checks and hooks.** Add ESLint, Prettier, Husky, and lint-staged. Resolve active-source findings without blanket disables, and keep the pre-commit path fast.
4. **Build the unit-test harness.** Configure Vitest isolation and add focused tests for stable pure behavior identified by the earlier-plan handoff. Temporarily break a representative assertion target to prove the test fails, then restore it.
5. **Build the component-test harness.** Configure Cypress Component Testing with Vite and real styles, create the minimal mount support, and cover gallery interaction, keyboard behavior, effect cleanup, callback contracts, and implemented form state.
6. **Add critical browser journeys.** Test home, shop, contact, and gallery behavior against the production build using local assets, controlled state, mobile coverage, and reduced-motion conditions where applicable.
7. **Create the CI workflow.** Run independent jobs with lockfile installation, caching, superseded-run cancellation, headless Chrome, and diagnostic artifacts. Verify pull-request events work for intermediate stack branches.
8. **Prove failure paths.** Confirm static checks, type errors, each test layer, and the aggregate command return nonzero status for a controlled temporary violation. Verify a staged violation is rejected in a disposable checkout without creating a synthetic commit.
9. **Close the ticket.** Run the complete local check, review the CI result, update the documented current state and commands, record evidence and remaining limitations below, and update the plan index and pull-request metadata.

## Acceptance criteria

- All documented scripts work from the supported local environment, and `check` covers the complete frontend verification set.
- Lint, formatting, type errors, and meaningful test failures cause nonzero exits and failing CI checks.
- Pre-commit hooks reject a staged violation in a disposable verification checkout without adding synthetic commits or bad files to the working branch. Properly formatted source passes.
- Regression coverage protects the intended gallery open/navigate/close sequence, event cleanup, and route behavior captured in the previous plans.
- Component tests cover keyboard behavior, form presentation/state where implemented, and relevant callback contracts. Existing accessibility limitations remain distinct from implemented guarantees.
- Representative browser journeys cover home, shop, contact, and gallery interaction with real styling and local photo assets. They include mobile viewport coverage and normal and reduced-motion conditions where relevant.
- Tests describe actual placeholder behavior honestly; no test implies checkout, contact delivery, publishing, or authentication exists before those integrations are implemented.
- CI failure artifacts are accessible and help diagnose a broken check. Checks remain applicable to the stack's intermediate PR bases.
- The final implementation PR links verification evidence and records any remaining limitations.

## Verification

- Run each documented script independently, then run `npm run check` from a clean working tree.
- Exercise the pre-commit hook with one valid staged file and one controlled invalid staged file in a disposable checkout; restore all temporary changes.
- Verify representative test and lint failures with temporary changes and confirm each corresponding CI job reports failure.
- Inspect Cypress screenshots, videos or logs from a controlled CI failure, then remove the fault and confirm the workflow passes.
- Review the final workflow triggers and job dependencies against both the stacked PR base and `main`.

## Risks and recovery

| Risk                                          | Mitigation or recovery                                                                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Local and CI environments drift               | Pin and document the Node runtime, install from the lockfile, and use the same package scripts in both environments.                    |
| Browser tests become flaky                    | Assert observable states, control clocks and network data, avoid arbitrary waits, and retain failure artifacts.                         |
| Vitest and Cypress types or discovery overlap | Give each runner explicit file patterns and TypeScript environments; verify neither runner discovers the other's files.                 |
| Pre-commit checks become too slow             | Restrict hooks to staged lint and formatting checks; keep the complete suite in explicit commands and CI.                               |
| Regression tests preserve accidental behavior | Base coverage on reviewed handoff contracts and record known limitations instead of asserting incidental implementation details.        |
| Tooling rules expose broad unrelated work     | Fix findings required by this ticket, document justified configuration choices, and move unrelated product changes to separate tickets. |

## Definition of done

- Every deliverable exists, every acceptance criterion is met, and the full local verification command passes from a clean checkout.
- GitHub Actions passes on the implementation PR and exposes useful failure output when a controlled fault is introduced.
- The implemented commands are accurately listed in `AGENTS.md` and the architecture's current-state sections.
- The plan index shows this ticket's final status and PR, and the implementation record below contains commands, CI evidence, decisions, and remaining limitations.
- The temporary testing exception for plans 001 and 002 is historical; normal red–green–refactor governs subsequent behavior changes.

## Implementation record

Implementation started on `test/verification-pipeline` from merge commit `06b586c`. The pre-change baseline passed `npm run typecheck` and `npm run build`; the build retained the known stale Browserslist-data warning and large local image outputs. Node `22.22.2` is the shared local and CI runtime. Tool selection preserves Vite 5 compatibility: Vitest 2 and Cypress 14 support the current application, while ESLint 9 is the newest major accepted by the current JSX accessibility plugin. Final commands, failure-path evidence, CI results, limitations, and the pull-request link will be recorded before completion.
