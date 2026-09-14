# 016 — Add feature availability controls

| Field          | Value                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| Type           | Feature                                                                           |
| Status         | Tracked in the [plan index](README.md)                                            |
| Depends on     | [015 — Brand asset payload optimization](015-brand-asset-payload-optimization.md) |
| Blocks         | [017 — Portfolio statement and résumé](017-portfolio-statement-and-resume.md)     |
| Planned branch | `feat/feature-availability-controls`                                              |
| PR base        | `main`                                                                            |
| PR             | Not opened                                                                        |

## Outcome

Unfinished features can be merged and deployed without appearing in production navigation or routes. One small typed module records which features are released, normal development mirrors production availability, and an explicit `npm run dev:all-features` command reveals every hidden view for local development. Tests continue to exercise feature behavior regardless of release state.

## Prerequisites and current state

- Complete Plan 015 first so feature gating does not overlap with the navigation asset rewrite.
- Shop is currently linked in the application navigation and routed at `/shop`, but it remains a placeholder without checkout integration. Its component already has direct Cypress coverage.
- `src/resources/navigation.ts` owns static navigation labels and routes. `Navigation.tsx` renders those items, while `RouteTransitionBoundary.tsx` owns route availability.
- The approved initial released state is `shop: false`. A disabled `/shop` request must render the existing 404 experience, and Shop must remain directly testable.
- Changing a release Boolean and deploying is acceptable. Runtime administration, instant remote toggles, and a third-party flag service are unnecessary.
- The approved command behavior is:
  - `npm run dev` respects committed release flags and therefore mirrors production availability.
  - `npm run dev:all-features` enables all known features only in Vite's development server.
  - `npm run build` followed by `npm run preview` shows the production release state.
- Feature availability controls presentation and routing only. It is not authorization, access control, credential protection, or a guarantee that hidden code is absent from production bundles.

## Scope

- Add one application-owned, typed source of truth for committed release Booleans, beginning with Shop.
- Resolve effective availability from the release state plus an explicit development-only all-features mode.
- Add `npm run dev:all-features` using Vite's native mode support without another package or shell-specific environment syntax.
- Keep the normal `dev`, `build`, and `preview` commands aligned with committed release flags.
- Hide disabled features from navigation and route composition.
- Render the normal fallback route for a direct visit to a disabled feature URL.
- Pass availability explicitly from application composition into navigation and routing so tests can exercise enabled and disabled states without mutating global build configuration.
- Keep Shop component tests active and add coverage for both sides of the navigation and route decisions.
- Document the distinction between release visibility and security.

Anticipated ownership includes a focused module under `src/app/`, `App.tsx`, `Navigation.tsx`, `RouteTransitionBoundary.tsx`, their existing tests, `package.json`, `architecture.md`, and command documentation in `AGENTS.md` when implementation makes the command available.

## Non-goals

- Do not add a feature-flag service, database, Cloudflare KV namespace, Worker endpoint, browser storage, cookie, query parameter, or administrator UI.
- Do not add `.env` files or expose a `VITE_*` production override solely for this initial policy.
- Do not add a generic flag framework, React Context, provider, custom Hook, or remote-loading state.
- Do not use flags to protect secrets, paid content, authenticated actions, or backend operations.
- Do not redesign or expand Shop, alter its placeholder data, or implement commerce.
- Do not add a duplicate `serve` command. Vite's existing `preview` command remains the production-build preview.
- Do not skip or weaken feature tests because a feature is unreleased.

## Deliverables

- Typed release-availability module with `shop: false` and a narrowly defined development override.
- Explicit availability inputs for application navigation and route composition.
- `dev:all-features` package script using Vite's `all-features` mode.
- Hidden Shop navigation and fallback behavior in normal development and production builds.
- Enabled Shop navigation and routing in all-features development.
- Unit and component coverage for release resolution, navigation, routing, and direct Shop behavior.
- Updated enduring architecture guidance and current command documentation.

## Implementation plan

1. Add failing policy tests for a released feature, an unreleased feature in normal mode, and the development-only all-features override. Assert resolved Booleans rather than environment implementation details.
2. Add a small typed `featureAvailability` module beside application composition. Keep committed release flags as the only per-feature source of truth and isolate the `import.meta.env.DEV && import.meta.env.MODE === "all-features"` decision in that module.
3. Export one resolved immutable availability object. Avoid a string-key API, registry class, provider, or generalized evaluation engine while the application has one flag.
4. Add `dev:all-features` as `vite --mode all-features`. Do not add an environment file or dependency. Ensure the override is ignored by production builds even if a nonstandard mode is supplied.
5. Pass the resolved availability from `App.tsx` into `Navigation` and `RouteTransitionBoundary` through explicit props. Tests may pass either state directly without changing the module-level release Boolean.
6. Filter Shop from navigation when disabled. Preserve item order, active indicator behavior, equal spacing, keyboard navigation, and accessible names for remaining links.
7. Omit the Shop route when disabled so the existing wildcard renders `NotFound`. Render the existing lazy Shop route when enabled; do not create a second disabled-feature page.
8. Add component coverage proving Shop is absent and `/shop` falls through when disabled, present and routable when enabled, and its component behavior remains tested directly in both repository modes.
9. Add production E2E coverage for the committed disabled state and a focused all-features development integration check without duplicating the full E2E suite.
10. Update `architecture.md` with the current release-visibility policy and `AGENTS.md` with the new command after it exists. Explain that enabling a release flag requires review and deployment and that flags do not enforce security.
11. Run focused checks and inspect normal development, all-features development, and a fresh production build in the browser. Ask the user to approve the displayed navigation and disabled-route behavior before final E2E and release checks.

## Acceptance criteria

- `shop: false` exists once as a typed committed release decision.
- Normal `npm run dev` and a normal production build both omit Shop from navigation and render the existing 404 for `/shop`.
- `npm run dev:all-features` displays Shop in navigation and makes `/shop` routable without editing source files.
- A production build cannot enable all features through the development-only mode condition.
- Enabling Shop in the release source makes both its navigation item and route available after build and deployment.
- Navigation and routing receive availability explicitly and can be tested in either state without mocking build globals.
- Shop's direct unit or component coverage continues to run while the released flag is false.
- Remaining navigation links retain their order, spacing, active indicator, focus behavior, and mobile layout.
- Direct visits, browser history, and route transitions behave normally for enabled, disabled, and unknown paths.
- No new runtime request, service, dependency, secret, local-storage value, or duplicate configuration source is introduced.
- Documentation states that feature flags control visibility and release timing, not authorization or bundle secrecy.

## Verification

Before visual approval:

- Focused Vitest tests for feature-availability resolution.
- Focused Cypress component tests for navigation, routing, and Shop behavior with explicit enabled and disabled inputs.
- `npm run lint`
- `npm run format:check`
- `npm run typecheck`
- `npm run build`
- Manual browser review with `npm run dev`, `npm run dev:all-features`, and a fresh `npm run build` plus `npm run preview`.
- Keyboard and mobile review of the remaining normal navigation and the all-features navigation.

After the user approves the output and requests no further visual edits:

- `npm run test:e2e`
- `npm run check`
- `npm run security:audit`

## Risks and recovery

| Risk                                          | Mitigation or recovery                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Development silently differs from production  | Keep normal `dev` release-accurate and require the explicitly named all-features command for the override.    |
| Hidden features lose meaningful test coverage | Inject availability into composition tests and continue mounting each feature directly regardless of release. |
| A disabled route remains reachable            | Gate both navigation and route declaration and test direct URLs, history, and unknown routes.                 |
| Flags are mistaken for access control         | Document the boundary and require backend authorization for any protected capability.                         |
| Flag plumbing becomes a framework             | Keep one typed object and explicit props; add a broader mechanism only when measured needs justify it.        |
| Preview serves a stale build                  | Document and use a fresh `npm run build` before `npm run preview` when validating production availability.    |

## Definition of done

- Normal development, all-features development, production preview, navigation, routing, and testing satisfy every acceptance criterion.
- Shop is hidden in the committed release state while its direct behavior remains covered.
- Focused checks pass before browser approval, the user approves the visible behavior, and final E2E and release checks pass afterward.
- Architecture and command documentation describe the implemented behavior without presenting flags as security.
- The final diff remains within availability policy, integration, tests, scripts, and documentation.
- The implementation record and plan index include final verification evidence and the PR link.

## Implementation record

Not started. On implementation, record final module ownership, enabled and disabled test evidence, command behavior, production-build confirmation, visual approval, commands, limitations, and PR link.
