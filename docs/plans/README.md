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

| Plan                                                                                                   | Status    | Branch                                    | PR                                                                                                                 |
| ------------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [001 — Code cleanup](001-code-cleanup.md)                                                              | Completed | `codex/code-cleanup`                      | [#2](https://github.com/avidixit27/avi-dixit.com/pull/2)                                                           |
| [002 — TypeScript overhaul](002-typescript-overhaul.md)                                                | Completed | `refactor/typescript-overhaul`            | [#3](https://github.com/avidixit27/avi-dixit.com/pull/3)                                                           |
| [003 — Verification pipeline](003-verification-pipeline.md)                                            | Completed | `test/verification-pipeline`              | [#4](https://github.com/avidixit27/avi-dixit.com/pull/4), [#5](https://github.com/avidixit27/avi-dixit.com/pull/5) |
| [004 — Toolchain security modernization](004-toolchain-security-modernization.md)                      | Completed | `chore/toolchain-modernization`           | [#14](https://github.com/avidixit27/avi-dixit.com/pull/14)                                                         |
| [005 — Responsive media and performance](005-responsive-media-performance-foundation.md)               | Completed | `feat/responsive-media-foundation`        | [#16](https://github.com/avidixit27/avi-dixit.com/pull/16)                                                         |
| [006 — Build and configuration conventions](006-simplify-build-and-configuration-conventions.md)       | Completed | `chore/setup-cloudflare`                  | [#23](https://github.com/avidixit27/avi-dixit.com/pull/23)                                                         |
| [007 — Tailwind 4 and configuration simplification](007-tailwind4-and-configuration-simplification.md) | Completed | `chore/tailwind4-config-simplification`   | [#24](https://github.com/avidixit27/avi-dixit.com/pull/24)                                                         |
| [008 — Responsive presentation regressions](008-responsive-presentation-regressions.md)                | Completed | `fix/responsive-presentation-regressions` | [#25](https://github.com/avidixit27/avi-dixit.com/pull/25)                                                         |

## Current sequence

Configuration migration, responsive regressions, and the meaningful coverage gate are independent prerequisites for resuming the dark visual system. The existing dark-system working tree is preserved but blocked until Plans 007–009 establish its clean base. Motion work follows the visual system and remains split by runtime, scroll composition, and route lifecycle risk.

| Plan                                                                        | Status      | Depends on | Planned branch                      | PR base                             | PR         |
| --------------------------------------------------------------------------- | ----------- | ---------- | ----------------------------------- | ----------------------------------- | ---------- |
| [009 — Meaningful unit coverage gate](009-meaningful-unit-coverage-gate.md) | In progress | 008        | `test/unit-coverage-quality-gate`   | `main`                              | Not opened |
| [010 — Dark visual system and shell](010-dark-visual-system-and-shell.md)   | Blocked     | 009        | `feat/dark-visual-system`           | `test/unit-coverage-quality-gate`   | Not opened |
| [011 — Accessible Motion foundation](011-accessible-motion-foundation.md)   | Planned     | 010        | `feat/motion-foundation`            | `feat/dark-visual-system`           | Not opened |
| [012 — Portfolio scroll composition](012-portfolio-scroll-composition.md)   | Planned     | 011        | `feat/portfolio-scroll-composition` | `feat/motion-foundation`            | Not opened |
| [013 — Route and layout transitions](013-route-and-layout-transitions.md)   | Planned     | 012        | `feat/route-layout-transitions`     | `feat/portfolio-scroll-composition` | Not opened |

### Stack management

- Create each child branch from the reviewed, committed state of its parent. Each PR targets its immediate parent and identifies that dependency, so its diff contains only its own layer.
- Use purpose-based branch prefixes such as `feat/`, `fix/`, `refactor/`, `test/`, and `chore/`; keep the remainder concise and kebab-case.
- Keep configuration migration, responsive fixes, coverage policy, visual redesign, and each motion class in their recorded scopes.
- Merge Plans 007–013 in dependency order. When a parent merges, update the dependent PR base and restack as necessary to avoid repeating merged changes.
- Preserve the current Plan 010 work while Plans 007–009 proceed. Restack it onto Plan 009 only after those prerequisites are merged and reviewed.
- Run pull-request CI for intermediate base branches as well as `main`. Introduce required-check rules only when the relevant workflow exists on the protected target.
- Each plan remains a separately scoped task. Update current command and architecture status when its implementation changes those facts.

## Maintaining plans

- Use stable numeric identifiers and descriptive filenames in this flat directory. A short type field inside each plan is sufficient; do not add feature/chore/fix subdirectories now.
- Use `Planned`, `In progress`, `Blocked`, or `Completed` in this index. Record a blocker with the affected plan when applicable.
- Keep the ticket independently actionable and aligned with the repository. Do not copy enduring architecture rules into every ticket; link the relevant section and state how it applies.
- When a plan is completed, move its index row into a completed section, retain the file, and link the final PR and verification evidence. Completed plans are historical context, not mandatory reading or new instructions.
- A routine small fix does not need a plan file. Create plans for work that benefits from explicit scope, dependencies, or acceptance criteria.

## Later direction

After the foundation stack, prioritize premium UI refinement, then define backend contracts and ownership for publishing and inquiries. Print commerce and optional Instagram import need separately scoped plans. Backend technologies and repository location remain open; no later plan files are scaffolded in advance.
