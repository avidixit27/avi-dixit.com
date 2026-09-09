# Repository guidance for Codex

## Model roles and handoffs

- Use Sol with high reasoning for architecture, design decisions, and implementation plans.
- Use Terra with medium reasoning to implement an approved plan.
- Use Sol with low reasoning for the post-implementation pull-request review.
- At a transition from planning to implementation, prompt the user to switch to Terra Medium before editing implementation code. At a transition from implementation to review, prompt the user to switch to Sol Low. When review findings require renewed architecture or planning, prompt the user to switch back to Sol High.
- Treat these as workflow roles rather than permission to change models automatically. Finish the current bounded phase and make the handoff at a logical checkpoint.

## Start with the actual repository

- Read [architecture.md](architecture.md) before structural changes, new features, dependency decisions, or changes to enduring technical conventions. Follow its distinction between current implementation, agreed direction, planned work, and open decisions.
- Inspect existing files, dependencies, scripts, configuration, and working-tree changes before editing. Search for existing components and behavior before adding another implementation.
- Before generating implementation code, state a three-bullet plan covering:
  1. exact files or ownership areas,
  2. intended observable behavior,
  3. proportionate verification.
- Complete the approved task with small, reviewable changes. Seek a decision before material scope expansion, additional services, deployment changes, or architectural commitments.
- Do not repeatedly ask permission for scoped edits and checks already authorized.
- A roadmap entry is not authorization to implement that feature.
- Preserve unrelated user changes.

## Find the relevant implementation plan

- Consult [docs/plans/README.md](docs/plans/README.md) for active work, dependencies, branch bases, and any explicitly approved temporary verification exception.
- Read the relevant plan and only the dependency outcomes needed for the task. Do not load every plan or completed plan by default.
- Treat the selected plan as the end-to-end work ticket. Before editing, ensure its outcome, prerequisites, scope, non-goals, deliverables, implementation steps, acceptance criteria, verification, risks, and definition of done are actionable.
- Resolve or record a material gap before proceeding rather than silently inventing requirements.
- Keep task scope, progress, material decisions, deviations, and verification evidence in the plan and its linked PR. Keep enduring design rules in `architecture.md`.
- Update the plan index when status or PR relationships change.
- A plan's existence does not authorize starting it. Apply a temporary exception only to the plans it explicitly names.
- Name branches with a purpose-based conventional prefix such as `feat/`, `fix/`, `refactor/`, `test/`, or `chore/`, followed by concise kebab-case wording.
- Keep the ticket accurate during implementation. At completion, record the result and evidence, link the PR, and update the index; do not leave planned language describing already-implemented repository state.

## Simplicity and maintainability

Optimize for the fewest concepts a future maintainer must keep in their head, not merely the fewest lines of code.

- Prefer one obvious source of truth for each concern.
- Eliminate redundant configuration, duplicate implementations, stale compatibility workarounds, and dead dependencies.
- Prefer framework-native or tool-native integration over extra glue layers when behavior remains clear and testable.
- Standardize conventions instead of supporting multiple equivalent patterns without a concrete need.
- Do not introduce a config file, wrapper, helper, abstraction, or dependency solely because it is conventional elsewhere.
- If one workaround exists only because of another workaround, investigate whether both can be removed.
- Do not restate defaults unless the explicit setting documents useful intent, provides a deliberate safeguard, or protects behavior that is easy to regress.
- Preserve intentional safeguards and measured optimizations even when they add configuration.
- Treat custom performance configuration as `measure first` rather than automatically removing or expanding it.
- Remove unused dependencies after confirming they are not required transitively by project-owned configuration or tooling.
- Prefer configuration colocated with the tool that owns it when no other tool requires a separate configuration file.
- Avoid speculative abstractions intended only for hypothetical future scale. Favor structures that can evolve when actual scale appears.

When reviewing complexity, classify findings mentally as:

- **Remove** — redundant, stale, or unused.
- **Simplify** — same responsibility with less machinery.
- **Keep** — justified complexity or intentional safeguard.
- **Measure first** — potentially removable optimization that requires evidence before changing.

## Architecture and component design

- Organize product behavior by feature; keep genuinely shared presentation and infrastructure at the top level. Create directories only when needed.
- Routes compose features. Features use shared components and transport. Shared components must not depend on routes, feature internals, or business API requests.
- Do not reach into another feature's internal implementation. Compose cross-feature workflows above the features or deliberately extract a shared responsibility.
- Prefer explicit props, callbacks, children, and composition. Use Context only for a demonstrated shared-state concern.
- Keep state local where possible, derive values rather than duplicating state, and give effects, listeners, timers, and DOM mutations clear ownership and cleanup.
- Keep feature-specific types, hooks, helpers, constants, API operations, and tests near their owners. Avoid catch-all utility or handler folders.
- Extract code for a coherent responsibility, readability, reuse, or testability. Three uses are not a prerequisite.
- Do not introduce speculative factories, generic frameworks, unnecessary wrappers, or indirection without a concrete benefit.
- Treat approximately 200 lines of hand-written source as a review signal, not a hard cap. Do not fragment a cohesive component merely to meet a number.
- Documentation and generated files are not subject to this signal.
- TypeScript is configured with strict no-emit checking. Use straightforward contracts and inference, preserve configured strictness, and do not routinely bypass checking with `any`, assertions, or suppression comments.
- Validate external data at integration boundaries.

## Styling and external components

- Follow shared Tailwind tokens and established visual conventions.
- Review responsive layouts, keyboard and touch use, visible focus, and reduced motion.
- Use component sources listed in `architecture.md` as candidates. Inspect each selected component's code, dependencies, framework assumptions, and license before adopting it.
- Adapt external components to project ownership, TypeScript contracts, styles, and accessibility.
- Preserve required attribution and record the source beside adapted code when applicable.
- Remove demo content and unrelated functionality.
- Do not install an entire library, additional animation runtime, framework, or compatibility layer solely because an example uses it.
- Prefer existing platform, React, Vite, Tailwind, and browser capabilities before adding another dependency.
- Verify visual changes with representative photographs and real browser behavior. Do not claim visual verification from linting or unit tests alone.

## Red-green-refactor and review

- For new behavior, write the smallest useful test first when practical, run it to establish the intended failure, implement the behavior, and refactor with the test passing.
- For bug fixes, add a regression test when the failure can be reproduced reliably.
- Before refactoring, protect the intended existing behavior and distinguish intentional changes from accidental regressions.
- Use Vitest for pure logic.
- Use Cypress component tests for rendered React behavior.
- Use Cypress end-to-end tests for critical application journeys and integration behavior that cannot be adequately verified below the browser level.
- Test observable results, not private implementation details.
- Avoid redundant test stacks, broad component snapshots, arbitrary sleeps, and live production dependencies.
- Review styling visually and test affected interactions.
- Documentation-only changes require consistency, formatting, and diff review; application test suites are unnecessary unless the documentation change also modifies executable configuration.
- Never weaken assertions, remove useful tests, skip a failing relevant check, or disable lint rules merely to obtain a passing result.
- A rule or test-policy change requires a concrete rationale.
- Review the final diff for scope, readability, accidental files, stale references, redundant configuration, and unresolved failures.
- Update architecture documentation with material architectural changes in the same PR.

## Verification strategy

Use risk-based, incremental verification. Do not treat the complete local test suite as the default feedback loop.

### During implementation

Run the smallest checks that give useful feedback for the behavior being changed.

Prefer, in order:

1. focused test covering the changed behavior,
2. affected component or unit-test suite,
3. TypeScript checking when types or configuration are affected,
4. linting for changed source,
5. production build when build behavior is affected,
6. end-to-end testing only when the change crosses browser or integration boundaries that lower-level checks cannot adequately cover.

Do not run `npm run check`, the complete Cypress suite, or the full E2E workflow after every edit.

A successful targeted test is preferable to repeatedly running unrelated checks.

### Before pushing

Run proportionate local verification sufficient to catch likely implementation mistakes before consuming CI.

Normally:

- run relevant focused tests,
- run `npm run typecheck` when TypeScript or typed configuration changed,
- run linting when source or linted configuration changed,
- run formatting checks when repository-formatted files changed.

Run a local production build or E2E suite when the task materially affects:

- Vite or build configuration,
- Tailwind/build-time styling integration,
- routing,
- responsive-media processing,
- deployment behavior,
- Cloudflare integration,
- Cypress/E2E infrastructure,
- browser-only behavior,
- critical application journeys,
- behavior for which no reliable lower-level test exists.

### Full verification

GitHub Actions is the authoritative complete PR verification gate.

GitHub independently runs:

- linting, formatting, and TypeScript checks,
- unit tests,
- Cypress component tests,
- production build and Cypress E2E tests.

Do not routinely duplicate the complete GitHub Actions matrix locally solely because it exists.

`npm run check` remains available for:

- explicit user request,
- high-risk cross-cutting changes,
- release investigation,
- CI reproduction,
- situations where GitHub CI is unavailable,
- cases where completing the task locally requires establishing the complete result before pushing.

### After pushing

- Use GitHub Actions as the authoritative full verification result.
- Check CI status after pushing.
- If CI passes, do not rerun the same complete suite locally.
- If CI fails, inspect the failed job and the relevant log rather than automatically rerunning every check.
- Reproduce the smallest failing command locally when useful, fix the cause, run focused verification, then push.
- Do not repeatedly poll GitHub CI at short intervals. Check once when reasonable; if still running, continue useful work or wait rather than spending repeated tool calls on unchanged status.
- Do not fetch or analyze logs from successful jobs unless they are relevant to an investigation.

Record which commands were actually run. Do not claim checks that were delegated to GitHub until GitHub reports their result.

## Model and reasoning selection

Use model capability deliberately. Optimize for total effort to a correct reviewed change, not the cheapest individual turn.

### Prompt the user to consider higher reasoning when

Before beginning substantial implementation, briefly recommend switching to a higher reasoning level when the task involves one or more of:

- architecture or major design decisions,
- unfamiliar or ambiguous failures,
- dependency or framework migrations,
- build-system or toolchain failures,
- complex TypeScript/type-system problems,
- performance architecture,
- concurrency or state-lifecycle bugs,
- security-sensitive implementation,
- cross-cutting refactors with significant regression risk,
- failures that have already survived one or more straightforward repair attempts,
- situations where choosing the wrong approach is likely to cause significant rework.

Use concise wording such as:

> This task has enough architectural/debugging uncertainty that a higher reasoning setting would likely reduce rework. Consider switching to Medium or High before we implement it.

Do not interrupt simple tasks with unnecessary model recommendations.

### Lower reasoning is appropriate for

Do not recommend higher reasoning merely for:

- mechanical renames,
- deterministic config cleanup,
- documentation edits,
- formatting,
- applying an already decision-complete plan,
- simple dependency removal with verified references,
- straightforward lint fixes,
- checking CI status,
- repetitive edits whose intended result is fully specified.

If the task starts mechanical but reveals ambiguity, regressions, or repeated failures, stop expanding guesses and recommend increasing reasoning before continuing.

### Planning versus implementation

For difficult work, prefer:

1. higher reasoning for investigation and a decision-complete implementation plan,
2. normal or lower reasoning for mechanical implementation when the plan eliminates meaningful ambiguity,
3. targeted local verification,
4. GitHub Actions for the complete CI matrix.

Do not redo architectural reasoning during implementation unless repository evidence invalidates the plan.

## Current commands and tooling

The source of truth is `package.json`; inspect it before selecting commands.

Use Node `22.22.2` from `.nvmrc`.

| Command                       | Purpose                                                         |
| ----------------------------- | --------------------------------------------------------------- |
| `npm run dev`                 | Start the Vite development server                               |
| `npm run build`               | Build the production frontend                                   |
| `npm run preview`             | Preview the application through the configured preview path     |
| `npm run lint`                | Run ESLint and fail on warnings                                 |
| `npm run format:check`        | Check repository formatting without editing                     |
| `npm run format`              | Apply Prettier explicitly                                       |
| `npm run typecheck`           | Check application and Cypress TypeScript without emitting files |
| `npm run test:unit`           | Run Vitest once                                                 |
| `npm run test:unit:watch`     | Run the Vitest development loop                                 |
| `npm run test:unit:coverage`  | Produce the focused unit coverage report                        |
| `npm run test:component`      | Run Cypress component tests in headless Chrome                  |
| `npm run test:component:open` | Open the Cypress component runner                               |
| `npm run test:e2e`            | Build, serve, and test critical journeys in headless Chrome     |
| `npm run security:audit`      | Fail on moderate or higher production dependency advisories     |
| `npm run check`               | Run the complete local verification sequence                    |

Do not assume this table is current when `package.json` differs. `package.json` wins.

Husky and lint-staged provide fast staged-file lint and formatting feedback before commits.

GitHub Actions independently runs lint/format/types, unit tests, component tests, and production build/E2E jobs on pull requests and pushes to `main`. Treat those CI jobs as the authoritative complete validation gate rather than routinely duplicating them locally.

The separate security workflow runs a production dependency audit and CodeQL on pull requests, pushes to `main`, a weekly schedule, and manual dispatch.

Pull requests also receive dependency review.

Dependabot checks npm and GitHub Actions dependencies weekly and opens grouped update pull requests.

GitHub secret scanning and push protection are enabled at the repository level.

Do not silence a security finding merely to pass. Determine whether it affects production, update the dependency when possible, and record accepted risk explicitly.

## Dependency and configuration changes

- Inspect `package.json`, lockfile state, imports, and tool configuration before adding or removing a dependency.
- Use `npm install` when intentionally changing dependency declarations or resolved versions.
- Use `npm ci` for reproducible installation from the committed lockfile, especially in CI.
- Do not manually edit `package-lock.json`.
- Remove dependencies that no longer serve a project-owned responsibility.
- Do not keep both old and new integration paths during a migration unless temporary compatibility is explicitly required.
- After replacing an integration, search for stale imports, config files, extension-specific workarounds, scripts, and documentation.
- Prefer one active module convention. With an ESM package, do not introduce `.mjs`, `.mts`, or `.cjs` solely to express module type unless a specific tool requires it.
- Before creating another configuration file, determine whether the owning tool can express the setting in an existing canonical config.
- Do not remove an explicit safeguard or optimization simply because it currently matches a default; preserve intentional settings unless the ticket explicitly reevaluates them.

## Token and tool efficiency

Use repository and tool context economically without compromising correctness.

- Read the files necessary for the current task; do not load unrelated plans or large directories by default.
- Search before reading entire files when looking for a specific implementation or reference.
- Avoid repeating commands whose result cannot have changed.
- Prefer focused test output over full-suite logs during iteration.
- Do not repeatedly run the full E2E suite after small changes when GitHub CI will execute it authoritatively.
- Do not repeatedly fetch successful CI logs.
- When CI fails, inspect only the failed job and relevant portion of its log before widening the investigation.
- Do not use a weaker reasoning approach merely to reduce cost when uncertainty makes rework likely.
- Conversely, do not spend high reasoning effort on deterministic mechanical work that is already fully specified.
- Optimize for total work required to reach a correct passing PR.

## Backend remains open

- Do not treat any backend technology or service as selected.
- Language, framework, database, authentication, hosting, deployment, and repository location remain undecided.
- A separate backend repository is permitted.
- Do not create backend directories, schemas, endpoints, or infrastructure based on earlier candidate discussions.
- Keep frontend integration behind explicit contracts and isolated transport, with deliberate loading, empty, success, error, and retry states.
- Keep service secrets out of browser code.
- Mock responses support development and tests; they do not establish that a production integration works.
- Agree backend contracts and ownership in a separately scoped task before implementing real integrations.
