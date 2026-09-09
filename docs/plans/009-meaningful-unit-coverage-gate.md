# 009 — Establish a meaningful unit coverage gate

| Field          | Value                                     |
| -------------- | ----------------------------------------- |
| Type           | Tooling                                   |
| Status         | Tracked in the [plan index](README.md)    |
| Depends on     | 008                                       |
| Blocks         | 010 and later feature work                |
| Planned branch | `test/unit-coverage-quality-gate`         |
| PR base        | `fix/responsive-presentation-regressions` |
| PR             | Not opened                                |

## Outcome

Vitest enforces at least 90% statements, branches, functions, and lines across the declared unit-testable TypeScript scope. Tests exercise meaningful decisions, edge cases, invariants, and intentional product policies so accidental logic or approved-value changes fail before deployment without inflating coverage through low-value assertions.

## Prerequisites and current state

- Plan 008 adds focused regression tests and establishes the final asset/font and orientation policies that this gate must include.
- The current Vitest scope is `src/**/*.ts`, excluding test files and Vite declarations. Rendered React behavior is owned by Cypress component and E2E tests.
- The current report is approximately 58% statements, 61% branches, 60% functions, and 56% lines, with only six unit tests concentrated in photo navigation.
- `photoNavigation.ts` is well covered but retains untested edge branches. `photoCatalog.ts`, navigation/site resources, shop products, and other pure policy/catalog modules have little or no coverage.
- Do not widen Vitest into `.tsx` solely to improve a number or add a second DOM-testing stack. Reevaluate scope only when meaningful pure logic is hidden in rendered components.

## Scope

- Configure global Vitest thresholds of 90 for statements, branches, functions, and lines over the declared unit scope.
- Add branch-focused tests for photo navigation and responsive orientation selection, including empty sets, wrapping, direction, eligibility changes, boundary aspect ratios, missing candidates, and deterministic fallbacks.
- Test photo-catalog invariants that protect production media: unique stable IDs, meaningful metadata, positive intrinsic dimensions, correct aspect ratios, valid responsive candidates, and complete fallback sources.
- Test application and feature resource catalogs for contract-level invariants such as unique route paths/IDs, required labels/destinations, valid external URLs, and valid positive product data.
- Extract deliberate behavioral settings from components only when doing so creates one feature-owned source of truth used by implementation and tests. Cover slideshow timing, transition timing, preload-window bounds, and similar approved policies with exact-value contract tests.
- Update pull-request CI to run `npm run test:unit:coverage` as the unit job so falling below any threshold fails the PR.
- Document the coverage scope and how approved policy changes must update implementation, tests, and the relevant plan/PR rationale together.

## Non-goals

- Do not write assertions whose only purpose is executing a line, mirror private implementation details, or use broad snapshots of catalogs/components.
- Do not exclude difficult pure modules, add ignore comments, weaken thresholds, or split files to manipulate percentages.
- Do not count Cypress tests as Vitest coverage or add Istanbul browser instrumentation in this ticket.
- Do not require exact tests for incidental local values, Tailwind utility syntax, third-party defaults, or generated files.
- Do not redesign application behavior, add features, or centralize unrelated constants in a catch-all module.

## Deliverables

- Meaningful unit tests for pure decision logic, media/resource invariants, and deliberate policies.
- Feature-owned policy constants where extraction removes duplicate or hidden sources of truth.
- Vitest 90% global thresholds for all four metrics.
- GitHub Actions coverage enforcement and a locally reproducible command.
- Recorded before/after coverage with an explanation of scope and any justified exclusions.

## Implementation plan

1. Run and record the starting coverage report by file and metric. Map each uncovered branch to user-visible behavior, a durable invariant, or incidental code; test only the first two categories.
2. Add failing tests for missing navigation/orientation branches and catalog/resource invariants. Use small explicit fixtures and observable outputs rather than implementation spies.
3. Identify approved behavioral settings embedded in components. Extract only coherent, feature-owned policy values needed by production and tests, then add exact contract tests for the approved values.
4. Refactor pure logic made visible by the tests while keeping rendered behavior in Cypress. Remove duplication exposed by the policy modules without creating a generic constants layer.
5. Add 90% global thresholds for statements, branches, functions, and lines. Confirm each threshold independently fails when temporarily exceeded by an uncovered branch or intentional policy mutation, then restore the code.
6. Change the CI unit-test job to run the coverage command and upload/report useful failure output without introducing a third-party coverage service.
7. Review every new test for a plausible regression it prevents. Remove tests that merely repeat syntax or inflate execution counts, then run local focused checks and complete PR CI.

## Acceptance criteria

- `npm run test:unit:coverage` fails below 90% for any of statements, branches, functions, or lines and passes only when all four meet the threshold.
- CI uses the same coverage command and blocks a pull request that violates any threshold.
- Every conditional branch in covered pure policy modules has a meaningful normal, boundary, or failure scenario where practical.
- Accidental changes to approved slideshow, transition, preload, media, and similar product-policy values fail an exact contract test.
- An approved value change requires an explicit production change, matching test expectation, and rationale; changing both intentionally remains possible.
- Catalog tests protect stable identity, required data, media dimensions/sources, and valid destinations without broad snapshots.
- `.tsx` rendering remains Cypress-owned, and no coverage exclusion or suppression is added merely to reach 90%.

## Verification

Focused red-green checks:

```bash
npm run test:unit -- src/features/portfolio
npm run test:unit:coverage
npm run typecheck
npm run lint
npm run format:check
```

Gate verification:

- Temporarily introduce one uncovered branch and confirm the relevant threshold fails, then revert it.
- Temporarily change one protected timing/preload policy value and confirm its contract test fails, then revert it.
- Confirm the GitHub Actions unit job invokes `npm run test:unit:coverage` and reports threshold failures clearly.
- Let the remaining Cypress/build jobs run through the normal pull-request CI matrix.

## Risks and recovery

| Risk                                                  | Mitigation or recovery                                                                                                     |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Coverage becomes a target to game                     | Require each test to name a behavior, boundary, or invariant and review low-value execution-only assertions out of the PR. |
| Exact-value tests create noisy intentional changes    | Protect only approved product policy and require the test update to document intent.                                       |
| A 90% aggregate hides a poorly tested critical module | Review per-file output and require complete meaningful branch coverage for small critical policy modules where feasible.   |
| Pure logic is trapped inside React components         | Extract only coherent decision logic with observable inputs/outputs; leave rendering and DOM behavior in Cypress.          |
| CI and local commands diverge                         | Make the package script the single command used in both environments.                                                      |

## Definition of done

- The meaningful test suite and all four thresholds satisfy the acceptance criteria.
- Mutation checks demonstrate that the gate catches one uncovered branch and one protected policy change.
- Relevant local checks and complete pull-request CI pass.
- No low-value snapshots, exclusions, suppressions, or redundant testing framework are introduced.
- Architecture, AGENTS guidance, plan record, and index describe the implemented policy accurately.
- The PR and plan index contain final status and links.

## Implementation record

Not started. Record baseline/final metrics, meaningful scenarios added, extracted policy values, mutation checks, CI change, exclusions retained with rationale, verification, and the PR link.
