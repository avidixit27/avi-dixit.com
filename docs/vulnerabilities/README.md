# Dependency and vulnerability maintenance

This directory records dependency maintenance separately from feature plans. Run the repository-local prompt in [`.agents/commands/dependency-maintenance.md`](../../.agents/commands/dependency-maintenance.md) for the weekly review and create one dated record from [TEMPLATE.md](TEMPLATE.md) for each maintenance pull request.

The records answer four questions without turning `architecture.md` into a changelog:

1. Which advisories and Dependabot pull requests were reviewed?
2. Which direct and transitive versions changed, and why?
3. Which updates were deferred or closed, and what would make them safe to revisit?
4. Did the upgrades make any configuration or compatibility glue removable?

Keep enduring design decisions in `architecture.md`, current execution guidance in `AGENTS.md`, and detailed command output in the pull request. Never copy secrets, private advisory data, or full CI logs into these records.

## Maintenance history

| Date       | Record                                                          | Pull request                                               | Outcome                                                                          |
| ---------- | --------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 2026-09-12 | [Cloudflare, React, and lint-staged](2026-09-12-maintenance.md) | [#32](https://github.com/avidixit27/avi-dixit.com/pull/32) | Patched Sharp; upgraded compatible bot groups; deferred unsupported TypeScript 7 |
