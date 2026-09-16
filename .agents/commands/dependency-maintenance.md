# Weekly dependency maintenance

Review this repository's Dependabot alerts and pull requests, apply compatible dependency updates, document outcomes, and audit configuration for simplifications enabled by upgrades.

Read `AGENTS.md`, the relevant dependency and verification sections of `architecture.md`, and `docs/vulnerabilities/README.md` before changing dependencies.

1. Inspect the working tree, `package.json`, lockfile, runtime version, package scripts, dependency configuration, open Dependabot alerts, and open Dependabot pull requests. Distinguish vulnerability fixes from routine upgrades.
2. Trace each alert to its direct owner. Group coupled packages such as React and React DOM. Do not merge bot branches blindly or use `--force`, `--legacy-peer-deps`, weakened checks, or an override that hides an incompatible direct dependency.
3. Apply compatible updates on an authorized conventional branch. For an incompatible update, record the blocking peer range or failing behavior and its concrete revisit condition. Do not push, close pull requests, or merge without authorization in the current request.
4. Use the Node version in `.nvmrc`. Run a clean install, a full development-tree audit, the repository production audit, and checks proportionate to the affected runtime, build, and tooling paths.
5. After the dependency changes pass, perform a focused configuration audit with Sol Low. If the user has not switched yet, stop at this phase boundary and prompt them to switch. Classify every conclusion as **Remove**, **Simplify**, **Keep**, or **Measure first**, and support it with repository evidence.
6. Create a dated record from `docs/vulnerabilities/TEMPLATE.md` and add it to the index. Record upgrades, advisories, deferred work, compatibility decisions, configuration conclusions, exact verification, and the pull request.

Prefer deleting obsolete glue enabled by an upgrade when verification proves it redundant. Keep explicit safeguards, direct dependencies invoked by scripts, and separate tool configuration when each tool genuinely consumes it. Avoid cleanup unrelated to the upgraded dependency unless the user expands the scope.
