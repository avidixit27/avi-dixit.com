# 015 — Make browser-test failures reproducible and actionable

| Field          | Value                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| Type           | Test reliability and tooling                                                         |
| Status         | Planned; approved for the next implementation in the [plan index](README.md)         |
| Depends on     | Plan 014 merged into `main` through PR #41                                           |
| Blocks         | [016 — Brand assets and photo delivery](016-brand-and-photo-payload-optimization.md) |
| Planned branch | `test/browser-test-reliability`                                                      |
| PR base        | `main`                                                                               |
| PR             | Not opened                                                                           |

## Outcome

Component tests and related production E2E checks establish the readiness and geometry they depend on, and failures provide enough evidence for a focused local investigation. A successful command must prove that the requested tests actually completed. CI should validate an evidenced fix rather than serve as the first useful reproduction environment.

## Prerequisites and current state

- Plan 014 is merged. Preserve its approved interactions and regression assertions.
- The RCA examined three failing Plan 014 runs with the same Footer assertion (`expected true to equal false`). Geometry and motion changes did not resolve it; commit `70a29c0` waited for wheel-listener registration and synchronized simulated scroll state. Because that commit changed multiple setup details, do not attribute the fix to one isolated cause without reproduction.
- Historical E2E failures included widths of 1265 versus 1280 and centers of 270 versus 277.5, consistent with scrollbar/layout viewport assumptions. Do not classify all historical CI failures as CT flakes.
- HeroSlideshow's cleanup test mounts and immediately replaces the component without proving timer creation. Lightbox's Escape test dispatches an event immediately after mount without proving listener readiness. These are investigation targets, not confirmed current failures.
- Node is pinned to 22.22.2. Inspected runs used Cypress 16 and Linux x64 Chrome 152; local macOS ARM64 used Chrome 153. Reconfirm actual versions during implementation. CI uses `ubuntu-latest` and fresh `npm ci`; existing local worktrees can share dependencies.
- `.github/workflows/frontend-ci.yml` uploads failure screenshots for seven days. The inspected failed CT run retained its screenshot. `cypress.config.ts` has no configured video or structured result output; the support files do not suppress uncaught exceptions.
- Earlier local Cypress commands returned zero without a test summary. Their cause is unresolved and they are not evidence of passing tests. Investigate launch/permission/output handling as well as runner configuration.
- User decisions: include CT and related E2E timing/viewport failures; stabilize tests and evaluate containers before deciding on adoption. Containerization is not yet selected.

## Scope

- Diagnose and correct readiness assumptions in the affected timer, listener, animation, and geometry tests. Audit similar patterns in the current browser specs without rewriting the suite wholesale.
- Establish reliable evidence that every requested spec completed, with nonzero executed tests and no unexpected pending/skipped tests. Detect missing/incomplete output independently of a process exit code.
- Add useful failure diagnostics: named assertions with relevant measured values, machine-readable per-spec results, environment details, existing screenshots, and video for CI browser runs with failed-run artifact retention.
- Validate that failures propagate through the local command, npm, and CI, including a runner that exits before producing results. Never mask the original failure during artifact collection.
- Evaluate a shared pinned Linux browser image on the affected tests after stabilization, measuring reproducibility and cold/warm execution cost before proposing adoption.
- Record a short investigation workflow in the owning test documentation and concise verification guidance in `AGENTS.md`; update architecture only for adopted enduring conventions.

Anticipated ownership: `src/app/Footer.cy.tsx`, `src/app/Navigation.cy.tsx`, `src/features/portfolio/HeroSlideshow.cy.tsx`, `src/features/portfolio/Lightbox.cy.tsx`, geometry specs, `cypress/e2e/portfolio.cy.ts`, Cypress configuration/support, CI workflow, and package scripts only where needed. A small runner adapter is justified only if built-in reporting cannot detect missing completion evidence.

## Non-goals

- No product redesign, codec changes, routing migration, backend work, or deployment changes.
- No blanket timeout increases, arbitrary sleeps, test exclusions, weakened assertions, blanket exception suppression, or test retries that turn an unexplained failure green.
- No second browser-test framework, paid reporting service, or required container workflow before the evaluation decision.
- Do not replace valid application effects or motion APIs solely to satisfy a racing test.

## Deliverables

- A failure inventory separating confirmed causes, likely causes, and unresolved observations, with source lines and run links.
- Focused regression fixes with explicit setup/readiness conditions and preserved observable outcomes.
- A completed-run report and failure artifacts that distinguish assertion failures, setup failures, and missing execution evidence.
- Reproduction commands for individual specs and bounded repeated runs.
- A measured container recommendation, with adopted or deferred status and reasons recorded.

## Implementation plan

1. Inspect the latest failed job before editing and identify its exact commit, test, assertion, environment, and retained artifacts. Reproduce each selected failure using the smallest affected spec; retain the baseline and count attempts/failures. If a suspected flake does not reproduce, record that limit instead of claiming a red/green result.
2. Investigate the silent local command. Use a fresh result location or run identifier, preserve stdout/stderr and exit status, and record requested specs, executed specs, test counts, and completion. Prefer built-in Cypress reporting and lifecycle hooks; if an external completion validator is required, keep it narrow and independently verify its failure cases. Stale artifacts must never count as a successful new run.
3. Fix confirmed synchronization causes. Wait for observable readiness before interaction; where cleanup itself is the contract, prove the listener/timer was registered before unmounting. Use retryable assertions for changing observations and one-shot actions for event dispatch. Control only the timers/frames needed by each test, without freezing unrelated scheduling. Avoid assumptions about global animation-frame call order.
4. Correct demonstrated geometry assumptions using the owning document's layout viewport and fresh measurements after the relevant layout/font/animation readiness. Preserve intentional overflow, alignment, interaction, and normal/reduced-motion assertions.
5. Add concise diagnostics at meaningful boundaries: listener/timer setup for lifecycle tests, viewport and bounding boxes for geometry tests, and expected/actual values with descriptive labels. Configure per-spec machine-readable results and CI video; retain failed-run screenshots, videos, results, and environment metadata for seven days. Do not collect credentials or broad environment dumps.
6. Test the reporting path with controlled assertion, startup, zero-test, missing-report, and incomplete-spec scenarios in an isolated temporary fixture. Require a nonzero command result for each invalid run. Verify a clean run reports the expected specs/tests. Do not commit a deliberately failing product test or alter the production workflow merely to demonstrate failure.
7. Run each repaired spec 20 times in fresh runner processes without retries, locally and in the Linux evaluation environment where available. Record duration and failures, including the original baseline. Compare full-suite execution to focused results to detect leaked state; a repeated-run result is evidence, not a guarantee of zero future flakes.
8. Evaluate a pinned official browser image with Node 22.22.2, lockfile-installed Cypress, and an explicit browser version. Use the same image/command in a candidate CI job only if adoption is approved. On ARM macOS, measure native Linux ARM64 and/or emulated Linux x64 with architecture differences stated. Install Linux dependencies inside the container; never reuse macOS `node_modules`. Record startup time, warm/cold duration, resource use, and failure reproduction. If Docker is unavailable, record the blocker and do not claim parity.
9. Present the container evidence and adoption recommendation to the user before making containers required. If adopted, pin a verified tag/digest, define its update owner/process, and share the invocation between local and CI; otherwise retain native execution and document the remaining environment differences. Both outcomes can complete this ticket if reliability and diagnostics acceptance criteria are met and the decision is recorded.
10. Run proportionate final checks, inspect the resulting diff, push, and inspect CI once. Investigate actual failed jobs; do not repeatedly poll unchanged checks. Link results and request the repository's post-implementation review.

## Acceptance criteria

- Selected lifecycle tests prove setup before dispatch/unmount and preserve cleanup, callback, motion, and navigation behavior.
- Selected geometry tests use the appropriate viewport and fail on real overflow/misalignment rather than platform scrollbar assumptions.
- Repaired specs pass 20 consecutive fresh-process runs per available target environment with retries disabled; test counts and all failures are recorded. Any unavailable target is an explicit outstanding limitation requiring a decision, not silently a pass.
- A success report identifies the commit, requested/completed specs, nonzero test counts, failure/pending counts, browser, Node, Cypress, OS, and architecture. Missing, stale, empty, or incomplete results fail verification even if the child process returned zero.
- A controlled assertion failure and runner/setup failure both propagate as nonzero results; available artifacts survive without changing that result. A failed CI browser job retains its report and applicable screenshots/video.
- No useful assertions are weakened, no test failures are excluded, and no exception handler or retry policy hides defects.
- Container evaluation produces measured evidence or an explicit availability limitation, and the user's adoption/defer decision is recorded. A container, if adopted, is shared with CI rather than only approximating an unpinned CI host locally.
- The full CI gate passes on the final change; local execution and historical CI evidence are reported separately.

## Verification

Starting commands under Node 22.22.2:

- `npm run test:component -- --spec src/app/Footer.cy.tsx,src/app/Navigation.cy.tsx,src/features/portfolio/HeroSlideshow.cy.tsx,src/features/portfolio/Lightbox.cy.tsx`
- `npm run test:component`
- `npm run test:e2e` (builds and serves production output)
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `git diff --check`

During iteration, select only the relevant spec. Run one full affected suite after the fixes and evidence checks; do not routinely repeat the entire CI matrix. Use unit tests for any new pure report-validation logic. Exact proposed report, repetition, and container commands must be implemented and documented before being claimed as available. The isolated failure-path exercise and normal/reduced-motion browser scenarios supplement these commands.

## Risks and recovery

| Risk                                                  | Mitigation or recovery                                                                                                           |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Readiness checks mirror internals too closely         | Prefer observable readiness; use narrowly scoped registration evidence when listener/timer lifecycle is the behavior under test. |
| Retrying interactions conceals missed events          | Dispatch once after readiness; retry observations without side effects.                                                          |
| New reporting falsely passes a partial run            | Validate requested versus completed specs using fresh run evidence; test startup and incomplete-run failure paths.               |
| Artifacts add cost or leak data                       | Keep diagnostics allowlisted, collect useful failure context, retain seven days, and measure video overhead.                     |
| Container emulation adds delay without reproducing CI | Measure before adoption; record architecture/resources and retain a native developer path.                                       |
| Pinned image becomes stale                            | Assign an update process if adopted; validate upgrades intentionally rather than use a moving tag.                               |

## Definition of done

- The accepted reliability, reporting, and diagnostic changes satisfy the acceptance criteria and pass CI.
- The implementation record links reproduction counts, failure-path checks, artifacts, and the container decision.
- Documentation and current commands reflect implemented behavior; unresolved hypotheses remain labeled.
- The user approves the implementation review, and the index records the final PR and status after merge.

## Implementation record

Not started. The user approved this plan on 2026-09-14: CT plus related E2E failures, execution evidence, diagnostics, and container evaluation before adoption. Planning continues with Plan 016; approval does not mean implementation has begun.

RCA references: [repeated Footer failure](https://github.com/avidixit27/avi-dixit.com/actions/runs/34863933856), [Footer test fix](https://github.com/avidixit27/avi-dixit.com/commit/70a29c04f9546de2eacfefe66088eced8d7ec4f9), [viewport-width failure](https://github.com/avidixit27/avi-dixit.com/actions/runs/34491681408), and [404 geometry failure](https://github.com/avidixit27/avi-dixit.com/actions/runs/34669175634).
