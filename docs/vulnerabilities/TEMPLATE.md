# YYYY-MM-DD — Dependency maintenance

| Field        | Value                              |
| ------------ | ---------------------------------- |
| Status       | In progress, completed, or blocked |
| Base         | Branch and commit                  |
| Branch       | Conventional branch name           |
| Pull request | Link or `Not opened`               |

## Inputs reviewed

- Open Dependabot alerts:
- Open Dependabot pull requests:
- Package audit result before changes:

## Changes

| Dependency | Scope                                           | Previous | Updated | Reason and owning dependency                   |
| ---------- | ----------------------------------------------- | -------- | ------- | ---------------------------------------------- |
| Package    | Production or development; direct or transitive | Version  | Version | Advisory, compatibility, or maintenance reason |

## Deferred or closed updates

| Update                  | Decision                        | Evidence                                     | Revisit when                                |
| ----------------------- | ------------------------------- | -------------------------------------------- | ------------------------------------------- |
| Package or pull request | Deferred, closed, or superseded | Peer range, failing behavior, or duplication | Concrete compatibility or product condition |

## Security and compatibility outcome

Record the advisories resolved, remaining findings, peer compatibility, runtime requirements, and any accepted risk. Do not call an alert resolved until the installed tree and relevant audit prove it.

## Post-upgrade configuration audit

| Classification                           | Configuration                   | Evidence and action                 |
| ---------------------------------------- | ------------------------------- | ----------------------------------- |
| Remove, Simplify, Keep, or Measure first | File, dependency, or convention | Why it changed or remains justified |

## Verification

List the exact commands run and their results. Distinguish local checks from GitHub checks and record any unavailable verification honestly.

## Follow-up

Record only concrete deferred work, ownership, and revisit conditions. Keep unrelated feature ideas in the plan system.
