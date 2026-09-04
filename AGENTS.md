# Repository guidance for Codex

## Start with the actual repository

- Read [architecture.md](architecture.md) before structural changes, new features, or dependency decisions. Follow its distinction between current implementation, agreed direction, planned work, and open decisions.
- Inspect existing files, dependencies, scripts, and working-tree changes before editing. Search for existing components and behavior before adding another implementation.
- Before generating implementation code, state a three-bullet plan covering the exact files, intended behavior, and verification.
- Complete the approved task with small reviewable changes. Seek a decision before material scope expansion, additional services, or deployment. Do not repeatedly ask permission for scoped edits and checks already authorized.
- A roadmap entry is not authorization to implement that feature. Preserve unrelated user changes.

## Find the relevant implementation plan

- Consult [docs/plans/README.md](docs/plans/README.md) for active work, dependencies, branch bases, and any explicitly approved temporary verification exception.
- Read the relevant plan and only the dependency outcomes needed for the task. Do not load every plan or completed plan by default.
- Treat the selected plan as the end-to-end work ticket. Before editing, ensure its outcome, prerequisites, scope, non-goals, deliverables, implementation steps, acceptance criteria, verification, risks, and definition of done are actionable. Resolve or record a material gap before proceeding.
- Keep task scope, checklists, progress, decisions, and verification evidence in the plan and its linked PR. Keep enduring design rules in `architecture.md`.
- Update the plan index when status or PR relationships change. A plan's existence does not authorize starting it. Apply a temporary exception only to the plans it explicitly names.
- Name branches with a purpose-based conventional prefix such as `feat/`, `fix/`, `refactor/`, `test/`, or `chore/`, followed by a concise kebab-case description.
- Keep the ticket accurate during implementation. At completion, record the result and evidence, link the PR, and update the index; do not leave planned language describing implemented repository state.

## Architecture and component design

- Organize product behavior by feature; keep genuinely shared presentation and infrastructure at the top level. Create directories only when needed.
- Routes compose features. Features use shared components and transport. Shared components must not depend on routes, feature internals, or business API requests.
- Do not reach into another feature's internal implementation. Compose cross-feature workflows above the features or deliberately extract a shared responsibility.
- Prefer explicit props, callbacks, children, and composition. Use Context only for a demonstrated shared state concern.
- Keep state local where possible, derive values rather than duplicating state, and give effects, listeners, timers, and DOM mutations clear ownership and cleanup.
- Keep feature-specific types, hooks, helpers, constants, API operations, and tests near their owners. Avoid catch-all utility or handler folders.
- Extract code for a coherent responsibility, readability, reuse, or testability. Three uses are not a prerequisite. Do not introduce speculative factories, generic frameworks, or unnecessary wrappers.
- Treat approximately 200 lines of hand-written source as a review signal, not a hard cap. Do not fragment a cohesive component merely to meet a number. Documentation and generated files are not subject to this signal.
- TypeScript is configured with strict no-emit checking. Use straightforward contracts and inference, preserve the configured strictness, and do not routinely bypass checking with `any`, assertions, or suppression comments. Validate external data at integration boundaries.

## Styling and external components

- Follow shared Tailwind tokens and established visual conventions. Review responsive layouts, keyboard and touch use, visible focus, and reduced motion.
- Use the component sources listed in `architecture.md` as candidates. Inspect each selected component's code, dependencies, framework assumptions, and license before adopting it.
- Adapt external components to project ownership, TypeScript contracts, styles, and accessibility. Preserve required attribution and record the source beside adapted code.
- Remove demo content and unrelated functionality. Do not install an entire library, additional animation runtime, or framework solely because an example uses it.
- Verify visual changes with representative photographs and real browser behavior. Do not claim visual verification from linting or unit tests alone.

## Red–green–refactor and review

- For new behavior, write the smallest useful test first, run it to establish the intended failure, implement the behavior, and refactor with the test passing.
- For bug fixes, add a regression test. Before refactoring, protect the intended existing behavior; distinguish intentional changes from accidental regressions.
- Use Vitest for pure logic and Cypress component tests for rendered React behavior once their harnesses are configured. Use Cypress end-to-end tests for critical application journeys.
- Test observable results, not private implementation details. Avoid redundant test stacks, broad component snapshots, arbitrary sleeps, and live production dependencies.
- Review styling visually and test affected interactions. Documentation-only changes need consistency and diff checks; application tests are unnecessary.
- Run relevant available checks during development and the configured release checks before completing implementation. Report exact commands, failures, and checks that could not run.
- Never weaken assertions, remove useful tests, skip failing checks, or disable lint rules merely to obtain a passing result. A rule change requires a concrete rationale.
- Review the final diff for scope, readability, accidental files, and unresolved failures. Update architecture documentation with material architectural changes in the same PR.

## Current commands and tooling

The source of truth is `package.json`; inspect it before selecting commands.

Use Node `22.22.2` from `.nvmrc`. The source of truth remains `package.json`; these are the main developer commands:

| Command                       | Purpose                                                         |
| ----------------------------- | --------------------------------------------------------------- |
| `npm run dev`                 | Start the Vite development server                               |
| `npm run build`               | Build the production frontend                                   |
| `npm run preview`             | Preview an existing build                                       |
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

Husky and lint-staged run fast staged-file lint and formatting checks before commits. GitHub Actions independently runs lint/format/types, unit tests, component tests, and production build/E2E jobs on pull requests and pushes to `main`.

The separate security workflow runs a production dependency audit and CodeQL on pull requests, pushes to `main`, a weekly schedule, and manual dispatch. Pull requests also receive dependency review. Dependabot checks npm and GitHub Actions dependencies weekly and opens grouped update pull requests. GitHub secret scanning and push protection are enabled at the repository level. Do not silence a security finding merely to pass; determine whether it affects production, update the dependency when possible, and record accepted risk explicitly.

## Backend remains open

- Do not treat any backend technology or service as selected. Language, framework, database, authentication, hosting, deployment, and repository location remain undecided.
- A separate backend repository is permitted. Do not create backend directories, schemas, endpoints, or infrastructure based on earlier candidate discussions.
- Keep frontend integration behind explicit contracts and isolated transport, with deliberate loading, empty, success, error, and retry states.
- Keep service secrets out of browser code. Mock responses support development and tests; they do not establish that a production integration works.
- Agree backend contracts and ownership in a separately scoped task before implementing real integrations.
