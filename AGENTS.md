# Repository guidance for Codex

## Model roles and handoffs

- Use Sol High for architecture, design decisions, and implementation plans.
- Use Terra Medium to implement an approved plan.
- Use Sol Low for post-implementation pull-request review.
- Prompt the user at each transition. Return to Sol High when a finding requires renewed planning.
- These roles do not grant permission to change models automatically.

## Start with the repository

- Read [architecture.md](architecture.md) before structural changes, new features, dependency decisions, or enduring convention changes.
- Inspect existing source, dependencies, scripts, configuration, and working-tree changes before editing. Search for an existing implementation before adding one.
- Before implementation code, state a three-bullet plan covering exact files or ownership areas, observable behavior, and proportionate verification.
- Keep approved work small and reviewable. Seek a decision before material scope expansion, new services, deployment changes, or architectural commitments.
- A roadmap entry is not implementation authorization. Preserve unrelated user changes.

## Use the relevant implementation plan

- Consult [docs/plans/README.md](docs/plans/README.md) for active work, dependencies, branch bases, and approved exceptions.
- Read the selected plan and only the prerequisite outcomes needed for the task. Completed plans are historical records, not default context.
- Treat the plan as the end-to-end ticket. Ensure its scope, non-goals, steps, acceptance criteria, verification, risks, and definition of done are actionable before editing.
- Record material gaps instead of inventing requirements. Keep task progress, decisions, deviations, and evidence in the plan and PR; keep enduring rules in `architecture.md`.
- Update the plan and index as status or PR relationships change. Do not leave planned wording for implemented repository state.
- Name branches with a purpose-based prefix such as `feat/`, `fix/`, `refactor/`, `test/`, or `chore/` and concise kebab-case wording.

## Simplicity and configuration

Optimize for the fewest concepts a maintainer must understand, not the fewest lines.

- Keep one obvious source of truth for each concern. Remove duplicate configuration, stale compatibility paths, dead dependencies, and unused implementations.
- Prefer framework-native or tool-native integration when it remains clear and testable. Colocate configuration with its owning tool when no other tool needs a separate file.
- Do not add a config file, wrapper, helper, abstraction, or dependency solely because it is conventional elsewhere or might help hypothetical future scale.
- Do not restate defaults unless the setting documents intent, enforces a safeguard, or protects behavior that is easy to regress.
- Preserve intentional safeguards and measured optimizations. Measure custom performance rules before removing or expanding them.
- Inspect `package.json`, lockfile state, imports, and configuration before changing dependencies. Use `npm install` for intentional dependency changes and `npm ci` for reproducible installs; never edit `package-lock.json` manually.
- After a migration, remove the old path and search for stale imports, files, scripts, extensions, and documentation. Do not retain parallel integrations without an explicit compatibility need.
- Use the package's ESM convention. Add `.mjs`, `.mts`, or `.cjs` only when a specific tool requires it.
- Classify complexity decisions as **Remove**, **Simplify**, **Keep**, or **Measure first**.

## Architecture and component design

- Organize product behavior by feature. Keep genuinely shared presentation and infrastructure at the top level, and create directories only when their first implementation needs them.
- Routes compose features. Features may use shared components and transport; shared components must not depend on routes, feature internals, or business API requests.
- Do not reach into another feature's internals. Compose cross-feature workflows above features or deliberately extract a shared responsibility.
- Prefer explicit props, callbacks, children, and composition. Use Context only for a demonstrated shared-state concern.
- Keep state local where possible and derive values rather than duplicating state. Give effects, listeners, timers, observers, and DOM mutations clear ownership and cleanup.
- Keep feature-specific types, hooks, helpers, constants, API operations, resources, and tests near their owner. Avoid catch-all utility or handler folders.
- Extract coherent responsibilities for readability, reuse, or testability. Do not introduce speculative factories, generic frameworks, wrappers, or indirection.
- Treat about 200 lines of hand-written source as a review signal, not a hard cap. Do not fragment cohesive code to meet a number; documentation and generated files are exempt.
- Preserve strict TypeScript checking. Prefer straightforward contracts and inference over `any`, unchecked assertions, or suppression comments. Validate external data at integration boundaries.

## Styling and external components

- Follow shared Tailwind tokens and established visual conventions. Review mobile and desktop layouts, keyboard and touch use, visible focus, and reduced motion.
- Evaluate component sources listed in `architecture.md` individually. Inspect code, dependencies, framework assumptions, and licenses before adoption.
- Adapt selected components to project ownership, TypeScript, styling, and accessibility. Preserve required attribution and record sources when applicable.
- Remove demo content and unrelated behavior. Do not install an entire library, framework, animation runtime, or compatibility layer for one example.
- Prefer existing browser, React, Vite, and Tailwind capabilities before adding dependencies.
- Verify visual changes with representative photographs and real browser behavior. Linting and unit tests do not constitute visual review.

## Red-green-refactor and review

- For behavior changes, write the smallest useful failing test first when practical, implement the behavior, and refactor while it passes.
- For reproducible bugs, add a regression test. Protect intended behavior before refactoring and distinguish intentional changes from regressions.
- Use Vitest for pure logic, Cypress component tests for rendered React behavior, and Cypress E2E tests for critical production-build journeys.
- Test observable results, meaningful boundaries, and durable invariants. Avoid implementation-detail assertions, broad snapshots, arbitrary sleeps, redundant test stacks, and live production dependencies.
- Never weaken assertions, remove useful tests, add exclusions, skip relevant failures, or disable lint rules merely to pass. Policy changes need a concrete rationale.
- Review styling visually and exercise affected interactions. Documentation-only changes need consistency, formatting, and diff checks unless they also change executable configuration.
- Review the final diff for scope, readability, accidental files, stale references, redundant configuration, and unresolved failures. Update architecture documentation when an enduring decision changes.

## Verification strategy

Use the smallest check that gives reliable feedback during development:

1. focused test for the changed behavior,
2. affected unit or component suite,
3. type checking when typed source or configuration changes,
4. linting and formatting for changed files,
5. production build for build-time behavior,
6. E2E only for browser or integration behavior that lower layers cannot prove.

Before pushing, run proportionate checks for likely failures. Run a local build or E2E suite when work materially affects Vite, Tailwind compilation, routing, responsive media, deployment, Cloudflare, Cypress infrastructure, browser-only behavior, or a critical journey.

GitHub Actions is the authoritative complete PR gate. It runs lint/format/types, unit tests, Cypress component tests, and production build/E2E jobs. Do not routinely duplicate that matrix locally solely because it exists.

Use `npm run check` for explicit requests, high-risk cross-cutting work, release investigation, CI reproduction, unavailable CI, or when the full local result is necessary before pushing.

After pushing:

- Check CI once when reasonable. If it is still running, continue useful work or wait instead of polling repeatedly.
- If CI passes, do not rerun the same complete suite locally. Do not fetch successful logs without a reason.
- If CI fails, inspect the failed job, reproduce the smallest useful command, fix the cause, and run focused verification before pushing.
- Record commands actually run and distinguish local results from CI results.

## Current commands and tooling

`package.json` is the command and dependency source of truth. Use Node `22.22.2` from `.nvmrc`.

| Command                       | Purpose                                                         |
| ----------------------------- | --------------------------------------------------------------- |
| `npm run dev`                 | Start the Vite development server                               |
| `npm run build`               | Build the production frontend                                   |
| `npm run preview`             | Preview through the configured Cloudflare path                  |
| `npm run lint`                | Run ESLint and fail on warnings                                 |
| `npm run format:check`        | Check formatting without editing                                |
| `npm run format`              | Apply Prettier explicitly                                       |
| `npm run typecheck`           | Check application and Cypress TypeScript without emitting files |
| `npm run test:unit`           | Run Vitest once                                                 |
| `npm run test:unit:watch`     | Run Vitest in watch mode                                        |
| `npm run test:unit:coverage`  | Produce the focused unit coverage report                        |
| `npm run test:component`      | Run Cypress component tests in headless Chrome                  |
| `npm run test:component:open` | Open the Cypress component runner                               |
| `npm run test:e2e`            | Build, serve, and test critical journeys in headless Chrome     |
| `npm run security:audit`      | Fail on moderate or higher production advisories                |
| `npm run check`               | Run the complete local verification sequence                    |

Husky and lint-staged check staged files before commits. GitHub Actions validates pull requests and pushes to `main`; a separate workflow runs the production audit and CodeQL. Pull requests also receive dependency review.

Dependabot checks npm and GitHub Actions weekly. Secret scanning and push protection are repository settings. Do not silence a security finding merely to pass; determine production impact, update when possible, and record any accepted risk.

## Token and tool efficiency

- Read only the files and plan dependencies needed for the current task. Search before loading large files or directories.
- Avoid repeating commands whose result cannot have changed. Prefer focused test output during iteration.
- Inspect failed CI jobs and relevant logs before widening an investigation.
- Match reasoning effort to uncertainty: use higher reasoning where a wrong approach risks rework and lower reasoning for decision-complete mechanical work.

## Backend remains open

- Do not treat any backend language, framework, database, authentication, hosting, deployment, or repository location as selected. A separate repository remains permitted.
- Do not create backend directories, schemas, endpoints, or infrastructure from earlier candidate discussions.
- Keep frontend integration behind explicit contracts and isolated transport, with deliberate loading, empty, success, error, and retry states.
- Keep secrets out of browser code. Mocks support development and tests but do not prove production integration.
- Agree backend contracts and ownership in a separately scoped task before implementing real integrations.
