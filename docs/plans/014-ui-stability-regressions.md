# 014 — Resolve UI stability regressions

| Field          | Value                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| Type           | Fix                                                                               |
| Status         | Tracked in the [plan index](README.md)                                            |
| Depends on     | PR #32 merged into `main` with its compatibility guards                           |
| Blocks         | [015 — Brand asset payload optimization](015-brand-asset-payload-optimization.md) |
| Planned branch | `fix/ui-stability-regressions`                                                    |
| PR base        | `chore/temporarily-ignore-typescript-7`                                           |
| PR             | [#38](https://github.com/avidixit27/avi-dixit.com/pull/38)                        |

## Outcome

Repeated interaction with the Home wordmark no longer restarts or shifts the portfolio, the editorial composition remains intentional at the intermediate responsive viewport, and a cold direct visit to an unknown route presents a stable surface before the 404 content is ready. The fixes preserve native scrolling, the established route-transition system, and the existing visual design.

## Prerequisites and current state

- Dependency-maintenance PR #32 is merged into `main`. This branch is stacked on `chore/temporarily-ignore-typescript-7`, which temporarily ignores TypeScript 7 until the installed `typescript-eslint` release supports it.
- `Navigation.tsx` renders the wordmark as a React Router link to `/`. Selecting it while already on `/` creates another location key, which can replay the location-keyed route boundary and portfolio presentation.
- The final approved same-route behavior is: do nothing when Home is already at the top; when Home is scrolled away from the top, run a short controlled return to the top without creating a route entry or replaying the route transition. Footer landing is suspended and canceled for that bounded reset so queued trackpad momentum cannot restore a stale destination.
- `PortfolioScrollComposition.tsx` introduces its sticky layout at the `md` breakpoint and uses viewport-relative section height and spacing. Obtain the user's recording and exact viewport dimensions before changing these rules; the reported gap must be reproduced rather than inferred from source alone.
- The application is a client-rendered Vite SPA with Cloudflare's single-page fallback. An unknown route cannot render route-specific React content before JavaScript starts. A stable branded bootstrap surface during that bounded interval is approved; server rendering and route-specific edge HTML are not.
- Plans 011–013 own reduced motion, scroll composition, and route transitions. Preserve those decisions and their regression coverage.

## Scope

- Prevent same-route wordmark activation from creating a new navigation entry or remounting Home.
- Preserve normal wordmark navigation to Home from every other route.
- Return an already-mounted Home page to the top when the user activates the wordmark from lower on the page.
- Reproduce and correct the excessive blank scrolling region around the `Coincidence / Predestination` composition at the reported intermediate viewport.
- Preserve the intended image drift, sticky presentation, surrounding section order, and mobile and wide layouts.
- Profile a cache-disabled direct load of an unknown route and distinguish bootstrap delay, font readiness, layout shift, and route animation behavior.
- Ensure the bootstrap interval has a stable, accessible presentation and that the 404 typography does not resize after its first rendered frame.
- Add focused regression coverage for each corrected behavior.

Anticipated ownership includes `src/app/Navigation.tsx`, its component coverage, the portfolio composition and its presentation policy/tests, the 404/bootstrap presentation, and the production E2E route journeys. Change only the files the verified causes require.

## Non-goals

- Do not redesign the portfolio, navigation, 404 copy, or established route animation.
- Do not add global smooth scrolling, change ordinary page scrolling, or route the same-page Home reset through React Router.
- Do not add SSR, static route generation, a custom Cloudflare routing service, or another runtime.
- Do not split or optimize the wordmark, portrait, or favicon; [Plan 015](015-brand-asset-payload-optimization.md) owns that measured payload work.
- Do not solve an unverified breakpoint hypothesis. If the reported gap cannot be reproduced from the supplied viewport and recording, record the evidence and seek a decision before changing layout rules.

## Deliverables

- Stable same-route wordmark behavior with regression coverage.
- A narrowly scoped responsive composition correction tied to a reproduced viewport.
- A stable cold-bootstrap and 404 presentation with cold-load evidence.
- Browser review at the reported viewport plus representative mobile and desktop sizes.
- Updated plan implementation record and linked pull request.

## Implementation plan

1. Add a failing navigation regression that activates the wordmark repeatedly at the top of Home and verifies that the current portfolio remains mounted and visually stationary. Add a second case that starts lower on Home and verifies an immediate return to the top without another route transition.
2. Handle same-route wordmark activation at the navigation owner: prevent redundant React Router navigation, leave the top state unchanged, and call the platform scroll API only when Home is away from the top. Preserve normal link semantics and navigation from other routes.
3. Reproduce the composition gap using the supplied recording, CSS viewport dimensions, device-pixel ratio, and reduced-motion setting. Record the failing geometry before editing.
4. Correct the smallest responsible breakpoint, height, sticky, or spacing rule. Keep constants with the portfolio presentation policy when they represent deliberate tunable behavior; do not add a general responsive abstraction for one composition.
5. Add a geometry-based component or E2E regression at the reproduced viewport. Assert the observable section relationship or bounded empty region rather than copying Tailwind class names into a test.
6. Profile a production build with cache disabled on a direct unknown URL. Record first paint, font readiness, layout changes, and requests before deciding whether the remaining flash comes from the empty root, stylesheet readiness, font swapping, or Motion startup.
7. If the root is visibly empty during bootstrap, render a small generic branded loading surface that React replaces when ready, using existing visual tokens where build ownership permits. If the root is already painted, fix only the verified font or route cause. Do not duplicate the full 404 markup in `index.html`.
8. Extend the cold-route regression to verify that the bootstrap surface never traps focus or remains after React mounts and that the 404 title and subtitle retain stable geometry from their first rendered frame.
9. Run focused lint, type, unit, and component checks. Review Home, the exact responsive reproduction, and a cache-disabled 404 in a real browser with normal and reduced motion.
10. Ask the user to approve the visual and interaction result. Only after approval, run the production E2E suite and full release checks, then record measurements and any remaining client-bootstrap limitation.

## Acceptance criteria

- Repeated wordmark activation at the top of Home does not change the route entry, selected hero, scroll position, or rendered geometry.
- Wordmark activation below the top of Home completes a controlled 900 ms return to `scrollY = 0` without replaying the route transition or restoring the previous footer destination.
- Wordmark activation from Shop, Contact, or an unknown route still navigates to Home through the established route boundary.
- At the reproduced intermediate viewport, the `Coincidence / Predestination` image and copy remain compositionally connected without an excessive blank scrolling interval.
- Existing representative mobile and wide layouts retain their intended sticky and parallax behavior.
- A cache-disabled direct visit to an unknown route displays a stable accessible surface while the SPA starts; it does not show an unexplained empty frame followed by resizing 404 typography.
- The loading surface is removed when React is ready and cannot remain focusable, announced repeatedly, or cover an interactive route.
- Reduced-motion behavior remains immediate and native scrolling remains 1:1.
- Every fix has an observable regression test, and no timing assertion relies on an arbitrary sleep or retry.

## Verification

Before visual approval:

- Focused Vitest and Cypress component files for changed behavior.
- `npm run lint`
- `npm run format:check`
- `npm run typecheck`
- Manual browser review at the exact reported viewport, current mobile and desktop viewports, repeated wordmark activation, direct cold 404 refresh, and reduced motion.
- Production Performance trace with cache disabled for the direct 404 visit.

After the user approves the output and requests no further visual edits:

- `npm run test:e2e`
- `npm run check`
- `npm run security:audit`

## Risks and recovery

| Risk                                              | Mitigation or recovery                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Same-route handling weakens link behavior         | Intercept only when the current pathname is Home; retain the ordinary link for every other route.             |
| Responsive fix damages adjacent viewports         | Reproduce exact geometry first and compare representative sizes immediately below and above the breakpoint.   |
| Bootstrap treatment flashes on fast navigations   | Keep it in initial document ownership only, make React replacement deterministic, and profile warm and cold.  |
| Loading markup duplicates application structure   | Keep it generic and minimal; do not maintain a second copy of route-specific 404 content.                     |
| A client SPA cannot meet an immediate-HTML target | Record the bounded bootstrap limitation and move edge rendering to a separate architectural plan if required. |

## Definition of done

- All three reported regressions satisfy their acceptance criteria at verified reproduction conditions.
- Focused checks pass before visual review, the user approves the browser result, and final E2E and release checks pass afterward.
- The implementation does not add scroll interception, duplicate route markup, or another rendering/runtime system.
- The final diff contains only this ticket's scope and receives structural review.
- The plan implementation record and plan index link the final PR and verification evidence.

## Implementation record

Implementation completed on `fix/ui-stability-regressions` and visually approved on 2026-09-14. The final changes:

- prevent same-route Home links from creating a new location key; the navigation owns a 900 ms eased return and reduced-motion remains immediate;
- explicitly suspend and cancel the footer landing animation during that reset, eliminating the stale target that restored the previous scroll position after the next wheel gesture;
- move the portfolio sticky composition to the `lg` breakpoint after reproducing the intermediate-width empty region, while preserving wide sticky behavior and image drift;
- paint a stable noninteractive bootstrap surface until fonts are ready, reset non-POP routes before paint, and keep the responsive 404 geometry stable;
- remove the React image-priority warning by using the supported `fetchPriority` prop spelling.

Focused Vitest passed (`7/7` footer policy tests). The full unit coverage gate passed with 34 tests, 100% statements/lines/functions, and 94.73% branches. Lint, formatting, TypeScript, `git diff --check`, and the production build pass locally. Cypress component and production E2E pass locally with Node 22.22.2; the E2E suite reports 14/14 passing. The local production dependency audit could not reach the npm registry and remains covered by the existing CI security workflow. The PR and final CI result remain to be recorded.
