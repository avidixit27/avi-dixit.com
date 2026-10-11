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
5. **Supersede:** when the user replaces a ticket's outcome, record the decision and replacement links, mark it `Superseded`, and retain the original scope as history rather than claiming it was completed.

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
| [016 — Brand assets and photo delivery](016-brand-and-photo-payload-optimization.md)                   | Completed | `perf/brand-and-photo-payloads`           | [#45](https://github.com/avidixit27/avi-dixit.com/pull/45)                                                                             |
| [017 — Feature availability controls](017-feature-availability-controls.md)                            | Completed | `feat/feature-availability-controls`      | [#47](https://github.com/avidixit27/avi-dixit.com/pull/47)                                                                             |
| [018 — Portfolio statement and résumé](018-portfolio-statement-and-resume.md)                          | Completed | `feat/portfolio-statement-resume`         | [#50](https://github.com/avidixit27/avi-dixit.com/pull/50)                                                                             |
| [019 — Portfolio collection models and routes](019-portfolio-collection-model-and-routes.md)           | Completed | `feat/portfolio-collection-routes`        | [#57](https://github.com/avidixit27/avi-dixit.com/pull/57)                                                                             |
| [022 — Slow-network portfolio performance](022-slow-network-portfolio-performance.md)                  | Completed | `fix/eager-portfolio-covers`              | [#59](https://github.com/avidixit27/avi-dixit.com/pull/59)                                                                             |

## Superseded

| Plan                                                                | Status     | Replacement                                                                                   |
| ------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| [020 — Portfolio discovery index](020-portfolio-discovery-index.md) | Superseded | Approved full-screen selector in Plan 019 / PR #57; delivery refinements in Plan 022 / PR #59 |

## Current sequence

Plans 019 and 022 reached `main` through PRs #57 and #59. Plan 020 is superseded by the approved selector. Plan 021 is in progress for documentation and feasibility only; no backend or infrastructure implementation is authorized.

| Plan                                                                                          | Status      | Planned branch                          | Depends on                                 |
| --------------------------------------------------------------------------------------------- | ----------- | --------------------------------------- | ------------------------------------------ |
| [021 — Instagram feed sync architecture](021-instagram-feed-sync-architecture.md)             | In progress | `docs/instagram-feed-sync-architecture` | 017                                        |
| [023 — Instagram owner dashboard](023-instagram-owner-dashboard.md)                           | Planned     | `feat/instagram-owner-dashboard`        | 021 and a tested local-command integration |
| [024 — Private Instagram sync and local curation](024-instagram-local-command-integration.md) | Planned     | `feat/instagram-local-sync`             | 021 approval and merge                     |

Plan 024 is approved and the owner completed the implementation model handoff; execution waits for the prerequisite documentation merge and a clean updated checkout. Plan 023 is the owner-approved dashboard follow-up, not authorization to begin coding; it depends on Plan 024 being implemented and tested. Ticket numbering does not override dependencies. Plan 021 has verified Meta v26.0 reads and least-privilege scope; documentation review/merge remains pending. Live renewal and Cloudflare resource measurements are release gates in Plan 024.

Plans 015–017 are approved. Plan 015 completed CT and related E2E reliability fixes, execution evidence, diagnostics, and a measured container evaluation; required container adoption was deferred. Former plans 015–020 were renumbered to 016–021 at the user's request.

Plan 016 combines the existing brand-asset work with AVIF → WebP → JPEG portfolio delivery, the format order selected by the user. It retains four widths per format, aligns lightbox preloading with display selection, and requires measured quality, transfer, decode, build, and storage evidence. Plan 017 adds approved feature availability controls, initially hiding Shop while keeping Contact released and both features available in explicit all-features development and tests. Plan 018 adds the Home statement and résumé; Plan 019 adds collections and the approved selector, replacing Plan 020's discovery proposal. Plan 021 depends on Plan 017 and authorizes architecture and feasibility evidence only.

### Stack management

- Create each child branch from the reviewed, committed state of its parent. Each PR targets its immediate parent and identifies that dependency, so its diff contains only its own layer.
- Use purpose-based branch prefixes such as `feat/`, `fix/`, `refactor/`, `test/`, and `chore/`; keep the remainder concise and kebab-case.
- Keep each plan within its recorded scope and create a separate ticket for material adjacent work.
- Keep dependent work based on the reviewed parent branch until that parent merges; then update its base to avoid repeating merged changes.
- Run pull-request CI for intermediate base branches as well as `main`. Introduce required-check rules only when the relevant workflow exists on the protected target.
- Each plan remains a separately scoped task. Update current command and architecture status when its implementation changes those facts.

## Maintaining plans

- Use stable numeric identifiers and descriptive filenames in this flat directory. A short type field inside each plan is sufficient; do not add feature/chore/fix subdirectories now.
- Use `Planned`, `In progress`, `Blocked`, `Completed`, or `Superseded` in this index. Record a blocker or replacement decision with the affected plan when applicable.
- Keep the ticket independently actionable and aligned with the repository. Do not copy enduring architecture rules into every ticket; link the relevant section and state how it applies.
- When a plan is completed, move its index row into a completed section, retain the file, and link the final PR and verification evidence. Completed plans are historical context, not mandatory reading or new instructions.
- A routine small fix does not need a plan file. Create plans for work that benefits from explicit scope, dependencies, or acceptance criteria.

## Later direction

After the current sequence, prioritize premium UI refinement, then define backend contracts and ownership for publishing and inquiries. Print commerce remains separately scoped. Plan 021 investigates optional Instagram synchronization without selecting a general backend platform; its implementation remains a later decision. Backend technologies and repository location otherwise remain open.
