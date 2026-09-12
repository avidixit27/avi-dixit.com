# 013 — Add route and layout transitions

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Type           | Feature                                                    |
| Status         | Tracked in the [plan index](README.md)                     |
| Depends on     | 012                                                        |
| Blocks         | Future project-detail transitions                          |
| Planned branch | `feat/route-layout-transitions`                            |
| PR base        | `main`                                                     |
| PR             | [#31](https://github.com/avidixit27/avi-dixit.com/pull/31) |

## Outcome

Route changes and existing shared layout states transition coherently without delaying navigation, breaking browser history, stealing focus, or shipping an unbounded animation layer. The behavior remains useful when animation is unavailable or reduced.

## Prerequisites and current state

- Plan 011 owns Motion configuration; Plan 012 establishes the final home-route hierarchy.
- Routes are composed in `App.tsx` with React Router. Home and the fallback route are eager; secondary Shop and Contact routes load under `Suspense`.
- No project-detail route currently provides a legitimate source/destination pair for a shared photograph transition. That effect remains deferred until such routes exist.

## Scope

- Define a short route enter/exit policy for `/`, `/shop`, and `/contact` using the existing Motion runtime.
- Coordinate route keys, `AnimatePresence`, Suspense fallback, focus placement, scroll restoration, and browser back/forward behavior.
- Apply layout animation to one existing state with real value, expected to be the navigation indicator, only if measurement and semantics support it.
- Keep transitions transform/opacity based and preserve immediate semantic navigation.
- Provide opacity-only or immediate reduced-motion behavior.

## Non-goals

- Do not add project-detail routes merely to demonstrate shared-element animation.
- Do not animate document scroll position, delay URLs, intercept history, or add loading theater.
- Do not add `domMax` unless the implemented layout animation requires it and the measured cost is accepted.
- Do not add parallax, sticky sections, or redesign route content.

## Deliverables

- Tested route transition boundary and focus/scroll policy.
- One justified layout animation or a recorded decision to keep the existing CSS transition.
- Reduced-motion behavior and bundle/profile evidence.
- Updated navigation and browser journeys.

## Implementation plan

1. Specify observable navigation, focus, scroll, and back/forward behavior in Cypress before adding animation.
2. Place the route transition boundary where React Router locations and lazy route readiness have one clear owner.
3. Add short enter/exit transitions without blocking URL changes or leaving an invisible outgoing route interactive.
4. Restore focus to a meaningful route heading/container and apply the agreed scroll policy after navigation while preserving back/forward expectations.
5. Evaluate the navigation indicator for Motion layout animation. Retain its existing CSS transform if Motion adds no clear value.
6. Test rapid repeated navigation, interrupted exits, unknown routes, slow lazy chunks, back/forward, mobile, keyboard, and reduced motion.
7. Measure bundle and runtime behavior; simplify any transition that introduces stuck states, long tasks, or disorienting movement.

## Acceptance criteria

- URLs and route content update correctly under normal, rapid, back, and forward navigation.
- Exit content cannot trap focus or remain interactable after the new route is active.
- Route focus and scroll behavior are deliberate, tested, and accessible.
- Reduced-motion users receive opacity-only or immediate changes.
- A slow route chunk never leaves the application permanently blank or blocked.
- Layout animation is added only to an existing meaningful state and does not require speculative shared-element infrastructure.
- Existing route, contact, shop, gallery, mobile, and reduced-motion journeys pass.

## Verification

- `npm run check`
- `npm run security:audit`
- `npm run build`
- Cypress journeys for links, rapid navigation, browser history, focus, scroll, slow chunks, mobile, and reduced motion.
- Production bundle comparison and Performance review during repeated transitions.

## Risks and recovery

| Risk                                          | Mitigation or recovery                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------ |
| AnimatePresence and router lifecycles diverge | Keep route location ownership centralized and test interruption/history paths. |
| Exit animation delays usable navigation       | Update semantics immediately and cap or remove exit duration.                  |
| Focus lands in outgoing content               | Make outgoing content noninteractive and move focus after route readiness.     |
| Layout features increase the Motion bundle    | Measure `domMax`; retain CSS when its benefit is insufficient.                 |

## Definition of done

- Route, focus, scroll, reduced-motion, and any layout animation satisfy acceptance criteria.
- Local and CI checks pass, and bundle/profile evidence is recorded.
- Shared photograph transitions remain deferred until real project routes exist.
- The PR and plan index contain final status and links.

## Implementation record

Implemented an application-owned `RouteTransitionBoundary` that centralizes the current React Router location, secondary-route lazy readiness, route-keyed Motion presence, fallback content, and the fallback route. The approved policy updates URLs immediately; push and replace navigation scroll to the top and move focus to the current route container, while browser back/forward retains browser-managed scroll and does not force focus. The incoming route renders at full opacity beneath an inert outgoing canvas, which fades and moves by a bounded amount to reveal it without a double-opacity black frame. Home remains eager because it is the primary destination and must render its hero beneath a route that is exiting. Shop and Contact retain their small lazy chunks. The existing CSS navigation indicator remains the chosen layout treatment because it already communicates the active destination without expanding the Motion feature set.

Test-first evidence: the new Cypress assertions initially failed because navigation retained its old scroll position and unknown URLs rendered no route. Later regression tests failed before both locally hosted fonts were preloaded and while Motion features remained an asynchronous first-interaction dependency. The final coverage protects route focus, normal navigation scroll reset, back navigation, the centered responsive 404, local font preloads, and synchronous availability of the selected Motion features. A cold production-profile sample recorded stable subtitle dimensions across 97 samples from first render through settled state, with Zina and Inter ready in the first sample and no `motionFeatures` request. Visual review of the Home, Shop, Contact, responsive 404, and cold 404-to-Home transition was approved before final E2E verification. Reduced-motion route changes are immediate and do not intercept scrolling or history.

Verification: the full release sequence passed linting, formatting, strict application and Cypress type checks, 34 unit tests (100% statements and lines; 94.54% branches), 20 component tests, and 13 production E2E journeys. `npm run security:audit` found zero production vulnerabilities. The production entry is 99.92 kB gzip and no longer requests the former 12.59 kB gzip `motionFeatures` chunk; compared with the prior split build, the entry increases by about 10.6 kB gzip while total compressed JavaScript decreases by about 2 kB. No `domMax`, additional animation runtime, or speculative shared-element system was added. Project-detail shared transitions remain deferred until real source/destination routes exist. PR [#31](https://github.com/avidixit27/avi-dixit.com/pull/31) awaits CI and final review.

The first CI run after the cold-load fix exposed a cross-platform assertion error in the 404 test: Linux Chrome reserves 15 px for the persistent scrollbar, while local macOS Chrome uses an overlay scrollbar. The page correctly centered within Linux's 540 px layout viewport, but the test compared it with the requested 555 px outer viewport. The regression now measures `documentElement.clientWidth` for both centering and overflow, preserving the visual requirement without retries, arbitrary waits, or widened tolerances.

The following run passed all production E2E journeys and exposed an independent security-workflow setup error. The audit job had no installed dependency tree, and npm's retiring quick-audit endpoint rejected the fresh checkout with HTTP 400 instead of returning advisory results. The job now performs a production-only `npm ci` with lifecycle scripts and npm's automatic audit disabled, then runs the existing explicit production audit. This preserves the security threshold while giving npm the dependency tree it requires.
