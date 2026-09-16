# 017 — Add feature availability controls

| Field          | Value                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| Type           | Feature                                                                              |
| Status         | In progress; tracked in the [plan index](README.md)                                  |
| Depends on     | [016 — Brand assets and photo delivery](016-brand-and-photo-payload-optimization.md) |
| Blocks         | [018 — Portfolio statement and résumé](018-portfolio-statement-and-resume.md)        |
| Planned branch | `feat/feature-availability-controls`                                                 |
| PR base        | `main`                                                                               |
| PR             | Not opened                                                                           |

## Outcome

Unfinished features can be merged and deployed without appearing in production navigation or routes. One small typed module records which features are released, normal development mirrors production availability, and an explicit `npm run dev:all-features` command reveals every hidden view for local development. Tests continue to exercise feature behavior regardless of release state.

## Prerequisites and current state

- Complete Plan 016 first so feature gating does not overlap with the navigation asset rewrite.
- Shop and Contact are currently linked in navigation and routed at `/shop` and `/contact`. Shop has no checkout integration; Contact has local form fields but no submission integration. Both have direct Cypress coverage.
- `src/resources/navigation.ts` owns static navigation labels and routes. `Navigation.tsx` renders those items, while `RouteTransitionBoundary.tsx` owns route availability.
- The user selected `shop: false` and `contact: false`. Both disabled URLs must render the existing 404 experience, and both features must remain directly testable and independently releasable.
- Hiding Contact also makes its email and Instagram links unavailable through that page. Relocating them elsewhere is not part of this plan.
- Changing a release Boolean and deploying is acceptable. Runtime administration, instant remote toggles, and a third-party flag service are unnecessary.
- The approved command behavior is:
  - `npm run dev` respects committed release flags and therefore mirrors production availability.
  - `npm run dev:all-features` enables all known features only in Vite's development server.
  - `npm run preview` builds and then previews through Wrangler; it shows the production release state. `preview:test` is the existing Vite preview used by production E2E after a fresh build.
- Feature availability controls presentation and routing only. It is not authorization, access control, credential protection, or a guarantee that hidden code is absent from production bundles.

## Scope

- Add one application-owned, typed source of truth for committed release Booleans, beginning with Shop and Contact.
- Resolve effective availability from the release state plus an explicit development-only all-features mode.
- Add `npm run dev:all-features` using Vite's native mode support without another package or shell-specific environment syntax.
- Keep the normal `dev`, `build`, and `preview` commands aligned with committed release flags.
- Hide disabled features from navigation and route composition.
- Render the normal fallback route for a direct visit to a disabled feature URL.
- Pass availability explicitly from application composition into navigation and routing so tests can exercise enabled and disabled states without mutating global build configuration.
- Keep Shop and Contact component tests active and cover both sides of each navigation and route decision, including mixed release states.
- Document the distinction between release visibility and security.

Anticipated ownership includes a focused module under `src/app/`, `App.tsx`, `Navigation.tsx`, `RouteTransitionBoundary.tsx`, navigation resources, their tests, direct Shop and Contact tests, the existing production E2E suite, a focused development-mode integration spec, `vite.config.ts`, `src/vite-env.d.ts`, `package.json`, Cypress/CI integration where needed, `architecture.md`, and command documentation in `AGENTS.md` when implementation makes the commands available. Recheck test-runner ownership after Plan 015; reuse its execution evidence and diagnostics.

## Non-goals

- Do not add a feature-flag service, database, Cloudflare KV namespace, Worker endpoint, browser storage, cookie, query parameter, or administrator UI.
- Do not add `.env` files or expose a `VITE_*` production override solely for this initial policy.
- Do not add a generic flag framework, React Context, provider, custom Hook, or remote-loading state.
- Do not use flags to protect secrets, paid content, authenticated actions, or backend operations.
- Do not redesign or expand Shop or Contact, alter placeholder data, implement commerce or inquiry submission, or relocate Contact links.
- Do not add a duplicate general-purpose `serve` command or change hosting behavior. Preserve the distinct existing Wrangler preview and Vite test-preview paths.
- Do not promise an HTTP 404 status: this plan controls the client-rendered fallback, not the host's SPA response status.
- Do not skip or weaken feature tests because a feature is unreleased.

## Deliverables

- Typed release-availability module with `shop: false`, `contact: false`, and a narrowly defined development override.
- Explicit availability inputs for application navigation and route composition.
- `dev:all-features` package script using Vite's `all-features` mode.
- Hidden Shop and Contact navigation and fallback behavior in normal development and production builds, leaving Home available.
- Enabled Shop and Contact navigation and routing in all-features development.
- Unit and component coverage for release resolution, navigation, routing, and direct Shop and Contact behavior; production disabled-route checks and an automated enabled-development smoke check.
- Updated enduring architecture guidance and current command documentation.

## Implementation plan

1. Add failing policy tests for both flags off, each mixed release state, both released, and the development-only all-features override. Assert resolved Booleans and independent releases rather than component implementation details.
2. Add a small typed `featureAvailability` module beside application composition. Keep committed release flags as the only per-feature source of truth. Pass one compile-time override Boolean from the existing Vite configuration into a pure resolver; keep build-tool globals outside that resolver.
3. Export one resolved immutable availability object. Avoid a string-key API, registry class, provider, or generalized evaluation engine for these two flags.
4. Add `dev:all-features` as `vite --mode all-features`. In the existing Vite config, derive the override from the actual development-server command and mode, explicitly excluding preview and builds. Declare the single injected Boolean in the existing environment types; do not duplicate release flags in build configuration. Do not rely solely on `import.meta.env.DEV`, since `NODE_ENV` can differ from the build command. Add no environment file or dependency. Verify that `vite build --mode all-features` cannot enable hidden features, including when `NODE_ENV=development` is supplied.
5. Pass the resolved availability from `App.tsx` into `Navigation` and `RouteTransitionBoundary` through explicit props. Tests may pass either state directly without changing the module-level release Boolean.
6. Filter each disabled feature from navigation. Preserve item order, spacing, keyboard navigation, and accessible names, including the Home-only layout. Recalculate the active indicator when visible items change without a pathname change, clean up removed link refs, and hide the indicator on fallback routes.
7. Omit each disabled route so the existing wildcard renders `NotFound`; retain existing lazy routes when enabled. Resolve the route frame's accessible label from effective availability too, so a disabled URL announces “Page not found,” not “Print shop” or “Contact.” Preserve route focus, scroll, outgoing-frame isolation, and reduced-motion behavior; do not create a second fallback page.
8. Add component coverage for disabled, enabled, and mixed states; direct disabled URLs, including trailing-slash variants; return-home navigation; and availability changes with the same pathname. Keep both feature components' existing behavior tests active independent of committed flags.
9. Adapt browser coverage without skipping assertions or weakening the release policy:
   - Production E2E must prove both links are absent, both direct URLs show the fallback, Home remains usable, and fallback-to-Home navigation and browser history work. Retain Home scroll-reset and unknown-route checks.
   - Move the existing enabled Shop/Contact journey and Home → Shop → Contact focus/scroll/history journey to a focused all-features development smoke spec, outside the default production spec selection. Preserve cart totals, Contact fields, and footer assertions there and/or in their existing direct component tests.
   - Preserve the production stylesheet regression gate for the Shop price and Contact focus-border utilities by checking the emitted production CSS rules and expected values, paired with direct component assertions for actual computed styles. A development-mode check alone is not evidence of production CSS generation.
   - Add one focused script for that development smoke check using existing Cypress and server-start/teardown tooling. Select the spec and base URL explicitly, use a strict dedicated port, and wire it into the existing CI workflow and full local check. Do not run the full portfolio suite against both servers. Require the execution evidence and failure artifacts established by Plan 015.
10. Update `architecture.md` with the current release-visibility policy and `AGENTS.md` with the new command after it exists. Explain that enabling a release flag requires review and deployment and that flags do not enforce security.
11. Run focused checks and inspect normal development, all-features development, and a fresh production build in the browser. Ask the user to approve the displayed navigation and disabled-route behavior before final E2E and release checks.

## Acceptance criteria

- `shop: false` and `contact: false` each exist once as typed committed release decisions.
- Normal `npm run dev` and production builds show Home navigation, omit Shop and Contact, and render the existing 404 experience for `/shop` and `/contact` with matching accessible labels.
- `npm run dev:all-features` displays both links and makes both routes usable without editing source files.
- Builds and previews cannot enable all features through the development-only override, even with the all-features mode or a development `NODE_ENV`.
- Enabling either release flag makes only that feature's navigation item and route available after build and deployment; the other remains disabled.
- Navigation and routing receive availability explicitly and can be tested in either state without mocking build globals.
- Shop and Contact direct component coverage continues to run while their release flags are false. Enabled-development smoke coverage and production disabled-route/stylesheet coverage run in CI without conditional skips.
- Remaining navigation links retain their order, spacing, active indicator, focus behavior, and mobile layout.
- Direct visits, browser history, and route transitions behave normally for enabled, disabled, and unknown paths.
- No new runtime request, service, dependency, secret, local-storage value, or duplicate configuration source is introduced.
- Documentation states that feature flags control visibility and release timing, not authorization or bundle secrecy.

## Verification

Before visual approval:

- Focused Vitest tests for feature-availability resolution and command/mode boundaries, including preview and build cases.
- Focused Cypress component tests for navigation, routing, Shop, and Contact with disabled, enabled, and mixed inputs.
- `npm run lint`
- `npm run format:check`
- `npm run typecheck`
- `npm run build`
- Check a fresh `vite build --mode all-features` artifact through the existing test preview, and repeat with `NODE_ENV=development`, proving both hidden routes remain disabled. Do not deploy these diagnostic builds. Finish with the normal production build.
- Manual browser review with `npm run dev`, `npm run dev:all-features`, and `npm run preview` (which performs its own build).
- Keyboard and mobile review of the remaining normal navigation and the all-features navigation.

After the user approves the output and requests no further visual edits:

- Production E2E and the focused all-features development smoke check, with Plan 015 execution evidence and artifacts.
- Run remaining proportionate checks not already covered; use `npm run check` only if cross-cutting risk or an explicit request warrants the full local matrix. Do not repeat the same matrix solely because CI runs it.
- Record CI results separately from local results; inspect failures without repeatedly polling CI.

## Risks and recovery

| Risk                                                               | Mitigation or recovery                                                                                               |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Development silently differs from production                       | Keep normal `dev` release-accurate and require the explicitly named all-features command for the override.           |
| Hidden features lose meaningful test coverage                      | Inject availability into composition tests and continue mounting each feature directly regardless of release.        |
| A disabled route remains reachable                                 | Gate both navigation and route declaration and test direct URLs, history, and unknown routes.                        |
| Flags are mistaken for access control                              | Document the boundary and require backend authorization for any protected capability.                                |
| Flag plumbing becomes a framework                                  | Keep one typed object and explicit props; add a broader mechanism only when measured needs justify it.               |
| Preview serves a stale build                                       | Use `npm run preview`, which builds first, or explicitly build before using `preview:test`.                          |
| A mode or environment variable leaks unreleased views into a build | Base the override on the actual development-server command, not only `DEV`; verify nonstandard builds.               |
| Hiding both pages silently removes browser coverage                | Preserve enabled journeys in the focused development smoke check, direct CT behavior, and production CSS assertions. |
| Fallback visuals and accessibility disagree                        | Resolve the route label from effective availability and verify it alongside the visible heading.                     |

## Definition of done

- Normal development, all-features development, production preview, navigation, routing, and testing satisfy every acceptance criterion.
- Shop and Contact are hidden in the committed release state while their direct behavior and enabled journeys remain covered.
- Focused checks pass before browser approval, the user approves the visible behavior, and final E2E and release checks pass afterward.
- Architecture and command documentation describe the implemented behavior without presenting flags as security.
- The final diff remains within availability policy, integration, tests, scripts, and documentation.
- The implementation record and plan index include final verification evidence and the PR link.

## Implementation record

Approved for implementation. On 2026-09-14, the user selected hiding both Shop and Contact and then approved the complete revised plan. Plans 015 and 016 must complete first.

Implementation began on 2026-09-15 from merged `main` in `feat/feature-availability-controls`. `src/app/featureAvailability.ts` owns the two committed release Booleans and resolves Vite's development-only override; `App.tsx` passes the result explicitly to navigation and route composition. The release decision is `shop: false` and `contact: true`.

Verification under Node 22.22.2 passed: focused availability unit tests; 13 focused Navigation and RouteTransitionBoundary Chrome component tests; lint, formatting, and type checks; the dedicated all-features development smoke test; and 13 normal production E2E tests against a fresh build. A `vite build --mode all-features` diagnostic with `NODE_ENV=development` also passed the production E2E suite, confirming that neither a nonstandard build mode nor environment variable enables the development-only override. The user approved normal and all-features browser behavior on 2026-09-15. CI and PR evidence remain to be recorded.

## Design references

- [Vite conditional configuration](https://vite.dev/config/#conditional-config): distinguish actual development, preview, and build commands at the build adapter.
- [Vite environment variables and modes](https://vite.dev/guide/env-and-mode): modes and `NODE_ENV` are separate concerns; neither alone proves the application is running in the development server.
