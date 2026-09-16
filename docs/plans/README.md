# Implementation plans

Treat each plan as an end-to-end work ticket: it should contain enough repository context, decisions, steps, acceptance criteria, and verification guidance to complete one bounded change without relying on chat history. This index is the source of truth for status, dependencies, branch relationships, and PR links. Read [architecture.md](../../architecture.md) for enduring design rules and [AGENTS.md](../../AGENTS.md) for execution instructions. Read only the selected plan and the dependency outcomes needed for that task.

## Ticket contract

Create substantial work from [TEMPLATE.md](TEMPLATE.md). Every ticket must contain:

- a stable ID and descriptive title, with type, status reference, dependency, branch, base, and PR metadata;
- the outcome and user or engineering value;
- prerequisites and repository facts to reconfirm before editing;
- bounded scope, explicit non-goals, and concrete deliverables or anticipated touchpoints;
- ordered implementation steps that resolve known design choices;
- observable acceptance criteria and exact available verification commands;
- risks, mitigations, recovery or rollback guidance, and a definition of done;
- an implementation record for decisions, deviations, commands, evidence, and follow-up work.

The ticket is the source of truth for execution. Keep it current when repository findings change the approach. A material scope or architectural change requires an explicit decision and a ticket update before continuing. Use the linked PR for discussion and detailed command output rather than duplicating a running transcript in Markdown.

### Ticket lifecycle

1. **Plan:** create the ticket from the template, resolve dependencies and material design choices, add it to the index, and leave its status `Planned`.
2. **Start:** confirm authorization and prerequisites, create the planned branch from its recorded base, and change the index status to `In progress`.
3. **Execute:** follow the ticket, keep acceptance criteria and the implementation record current, and mark the ticket `Blocked` in the index when a recorded dependency prevents progress.
4. **Complete:** satisfy the definition of done, link the PR and verification evidence, change the status to `Completed`, and move the row to a completed section after merge.

## Completed

Completed tickets are historical records. Read one only when its outcome or implementation decision is a prerequisite for current work.

| Plan                                                                                                   | Status    | Branch                                    | PR                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [001 — Code cleanup](001-code-cleanup.md)                                                              | Completed | `codex/code-cleanup`                      | [#2](https://github.com/avidixit27/avi-dixit.com/pull/2)                                                                               |
| [002 — TypeScript overhaul](002-typescript-overhaul.md)                                                | Completed | `refactor/typescript-overhaul`            | [#3](https://github.com/avidixit27/avi-dixit.com/pull/3)                                                                               |
| [003 — Verification pipeline](003-verification-pipeline.md)                                            | Completed | `test/verification-pipeline`              | [#4](https://github.com/avidixit27/avi-dixit.com/pull/4), [#5](https://github.com/avidixit27/avi-dixit.com/pull/5)                     |
| [004 — Toolchain security modernization](004-toolchain-security-modernization.md)                      | Completed | `chore/toolchain-modernization`           | [#14](https://github.com/avidixit27/avi-dixit.com/pull/14)                                                                             |
| [005 — Responsive media and performance](005-responsive-media-performance-foundation.md)               | Completed | `feat/responsive-media-foundation`        | [#16](https://github.com/avidixit27/avi-dixit.com/pull/16)                                                                             |
| [006 — Build and configuration conventions](006-simplify-build-and-configuration-conventions.md)       | Completed | `chore/setup-cloudflare`                  | [#23](https://github.com/avidixit27/avi-dixit.com/pull/23)                                                                             |
| [007 — Tailwind 4 and configuration simplification](007-tailwind4-and-configuration-simplification.md) | Completed | `chore/tailwind4-config-simplification`   | [#24](https://github.com/avidixit27/avi-dixit.com/pull/24)                                                                             |
| [008 — Responsive presentation regressions](008-responsive-presentation-regressions.md)                | Completed | `fix/responsive-presentation-regressions` | [#25](https://github.com/avidixit27/avi-dixit.com/pull/25)                                                                             |
| [009 — Meaningful unit coverage gate](009-meaningful-unit-coverage-gate.md)                            | Completed | `test/unit-coverage-quality-gate`         | [#26](https://github.com/avidixit27/avi-dixit.com/pull/26)                                                                             |
| [010 — Dark visual system and shell](010-dark-visual-system-and-shell.md)                              | Completed | `feat/dark-visual-system`                 | [#27](https://github.com/avidixit27/avi-dixit.com/pull/27)                                                                             |
| [011 — Accessible Motion foundation](011-accessible-motion-foundation.md)                              | Completed | `feat/motion-foundation`                  | [#29](https://github.com/avidixit27/avi-dixit.com/pull/29)                                                                             |
| [012 — Portfolio scroll composition](012-portfolio-scroll-composition.md)                              | Completed | `feat/portfolio-scroll-composition`       | [#30](https://github.com/avidixit27/avi-dixit.com/pull/30)                                                                             |
| [013 — Route and layout transitions](013-route-and-layout-transitions.md)                              | Completed | `feat/route-layout-transitions`           | [#31](https://github.com/avidixit27/avi-dixit.com/pull/31)                                                                             |
| [014 — UI stability regressions](014-ui-stability-regressions.md)                                      | Completed | `fix/restore-ui-stability-regressions`    | [#41](https://github.com/avidixit27/avi-dixit.com/pull/41); original review [#38](https://github.com/avidixit27/avi-dixit.com/pull/38) |
| [015 — Browser-test reliability](015-browser-test-reliability.md)                                      | Completed | `test/browser-test-reliability`           | [#43](https://github.com/avidixit27/avi-dixit.com/pull/43)                                                                             |

## Current sequence

Plan 015 reached `main` through PR #43. Plan 016 is the next approved implementation.

| Plan                                                                                         | Status    | Planned branch                          | Depends on |
| -------------------------------------------------------------------------------------------- | --------- | --------------------------------------- | ---------- |
| [016 — Brand assets and photo delivery](016-brand-and-photo-payload-optimization.md)         | In review | `perf/brand-and-photo-payloads`         | 015        |
| [017 — Feature availability controls](017-feature-availability-controls.md)                  | In review | `feat/feature-availability-controls`    | 016        |
| [018 — Portfolio statement and résumé](018-portfolio-statement-and-resume.md)                | Planned   | `feat/portfolio-statement-resume`       | 017        |
| [019 — Portfolio collection models and routes](019-portfolio-collection-model-and-routes.md) | Planned   | `feat/portfolio-collection-routes`      | 018        |
| [020 — Portfolio discovery index](020-portfolio-discovery-index.md)                          | Planned   | `feat/portfolio-discovery-index`        | 019        |
| [021 — Instagram feed sync architecture](021-instagram-feed-sync-architecture.md)            | Planned   | `docs/instagram-feed-sync-architecture` | 017        |

Plans 015–017 are approved. Plan 015 completed CT and related E2E reliability fixes, execution evidence, diagnostics, and a measured container evaluation; required container adoption was deferred. Former plans 015–020 were renumbered to 016–021 at the user's request.

Plan 016 combines the existing brand-asset work with AVIF → WebP → JPEG portfolio delivery, the format order selected by the user. It retains four widths per format, aligns lightbox preloading with display selection, and requires measured quality, transfer, decode, build, and storage evidence. Plan 017 then adds approved feature availability controls, initially hiding Shop while keeping Contact released and both features available in explicit all-features development and tests. Plan 018 adds the Home statement and résumé; Plans 019–020 add collections and discovery. Plan 021 can begin after Plan 017, but authorizes architecture and feasibility evidence only.

### Stack management

- Create each child branch from the reviewed, committed state of its parent. Each PR targets its immediate parent and identifies that dependency, so its diff contains only its own layer.
- Use purpose-based branch prefixes such as `feat/`, `fix/`, `refactor/`, `test/`, and `chore/`; keep the remainder concise and kebab-case.
- Keep each plan within its recorded scope and create a separate ticket for material adjacent work.
- Keep dependent work based on the reviewed parent branch until that parent merges; then update its base to avoid repeating merged changes.
- Run pull-request CI for intermediate base branches as well as `main`. Introduce required-check rules only when the relevant workflow exists on the protected target.
- Each plan remains a separately scoped task. Update current command and architecture status when its implementation changes those facts.

## Maintaining plans

- Use stable numeric identifiers and descriptive filenames in this flat directory. A short type field inside each plan is sufficient; do not add feature/chore/fix subdirectories now.
- Use `Planned`, `In progress`, `Blocked`, or `Completed` in this index. Record a blocker with the affected plan when applicable.
- Keep the ticket independently actionable and aligned with the repository. Do not copy enduring architecture rules into every ticket; link the relevant section and state how it applies.
- When a plan is completed, move its index row into a completed section, retain the file, and link the final PR and verification evidence. Completed plans are historical context, not mandatory reading or new instructions.
- A routine small fix does not need a plan file. Create plans for work that benefits from explicit scope, dependencies, or acceptance criteria.

## Later direction

After the current sequence, prioritize premium UI refinement, then define backend contracts and ownership for publishing and inquiries. Print commerce remains separately scoped. Plan 021 investigates optional Instagram synchronization without selecting a general backend platform; its implementation remains a later decision. Backend technologies and repository location otherwise remain open.
