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

## Active sequence

The agreed order is cleanup, TypeScript, then verification tooling. Cleanup establishes readable responsibilities; TypeScript gives them checked contracts; the verification feature makes correctness repeatably enforceable.

The stack starts from `react-website-overhaul`. The names below are planned; the documentation does not create branches or authorize implementation.

| Plan | Status | Depends on | Planned branch | PR base | PR |
| --- | --- | --- | --- | --- | --- |
| [001 — Code cleanup](001-code-cleanup.md) | Planned | Existing frontend | `codex/code-cleanup` | `react-website-overhaul` | Not opened |
| [002 — TypeScript overhaul](002-typescript-overhaul.md) | Planned | 001 | `codex/typescript-overhaul` | `codex/code-cleanup` | Not opened |
| [003 — Verification pipeline](003-verification-pipeline.md) | Planned | 002 | `codex/verification-pipeline` | `codex/typescript-overhaul` | Not opened |

### Stack management

- Create each child branch from the reviewed, committed state of its parent. Each PR targets its immediate parent and identifies that dependency, so its diff contains only its own layer.
- Keep the three scopes distinct. Do not mix visual redesign, image hosting, a backend, commerce, or unrelated dependency upgrades into this stack.
- Merge in dependency order: 001, 002, then 003. When a parent merges, update the dependent PR base and restack as necessary to avoid repeating merged changes. Do not blindly merge a child into an obsolete parent branch.
- Run pull-request CI for intermediate base branches as well as `main`. Introduce required-check rules only when the relevant workflow exists on the protected target.
- Each plan remains a separately scoped task. Update current command and architecture status when its implementation changes those facts.

### Temporary verification exception: plans 001 and 002 only

The user explicitly chose cleanup and TypeScript migration before introducing automated tests. For these two plans, capture intended behavior before editing, perform before/after browser checks, and run production builds. Plan 002 also requires strict type checking. Record observed behavior and regression scenarios in the plan's implementation record or linked PR for plan 003 to automate.

Do not claim that these checks constitute a red–green–refactor loop or that unavailable lint/test tooling passed. Keep this exception limited to the two bootstrap changes. It does not authorize unrelated new behavior or silently waive failed available checks. Plan 003 establishes the harness and regression baseline; subsequent behavior changes follow the normal TDD rules.

## Maintaining plans

- Use stable numeric identifiers and descriptive filenames in this flat directory. A short type field inside each plan is sufficient; do not add feature/chore/fix subdirectories now.
- Use `Planned`, `In progress`, `Blocked`, or `Completed` in this index. Record a blocker with the affected plan when applicable.
- Keep the ticket independently actionable and aligned with the repository. Do not copy enduring architecture rules into every ticket; link the relevant section and state how it applies.
- When a plan is completed, move its index row into a completed section, retain the file, and link the final PR and verification evidence. Completed plans are historical context, not mandatory reading or new instructions.
- A routine small fix does not need a plan file. Create plans for work that benefits from explicit scope, dependencies, or acceptance criteria.

## Later direction

After the foundation stack, prioritize premium UI refinement, then define backend contracts and ownership for publishing and inquiries. Print commerce and optional Instagram import need separately scoped plans. Backend technologies and repository location remain open; no later plan files are scaffolded in advance.
