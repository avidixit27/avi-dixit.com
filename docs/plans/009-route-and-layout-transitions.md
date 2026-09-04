# 009 — Add route and layout transitions

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| Type           | Feature                                |
| Status         | Tracked in the [plan index](README.md) |
| Depends on     | 008                                    |
| Blocks         | Future project-detail transitions      |
| Planned branch | `feat/route-layout-transitions`        |
| PR base        | `feat/portfolio-scroll-composition`    |
| PR             | Not opened                             |

## Outcome

Route changes and existing shared layout states transition coherently without delaying navigation, breaking browser history, stealing focus, or shipping an unbounded animation layer. The behavior remains useful when animation is unavailable or reduced.

## Prerequisites and current state

- Plan 007 owns Motion configuration; Plan 008 establishes the final home-route hierarchy.
- Routes are composed in `App.tsx` with React Router and lazy-loaded route components under `Suspense`.
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

Not started. Record route policy, test-first evidence, Motion feature choice, bundle delta, accessibility review, CI, limitations, and PR link.
