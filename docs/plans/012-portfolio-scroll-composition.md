# 012 — Build the portfolio scroll composition

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Type           | Feature                                                    |
| Status         | Tracked in the [plan index](README.md)                     |
| Depends on     | 011                                                        |
| Blocks         | 013 and homepage refinement                                |
| Planned branch | `feat/portfolio-scroll-composition`                        |
| PR base        | `main`                                                     |
| PR             | [#30](https://github.com/avidixit27/avi-dixit.com/pull/30) |

## Outcome

The home portfolio demonstrates the approved cinematic direction with real photography, restrained reveals, one native-sticky story, bounded image drift, two locally bounded stacked-section transitions, and an intentional saturated-color release. Motion strengthens hierarchy while normal scrolling, content access, and media performance remain stable.

## Prerequisites and current state

- Plans 005, 010, and 011 provide responsive media, semantic visual tokens, and the accessible Motion boundary.
- Approve the representative photograph sequence and editorial copy before implementation. Store fixed copy in feature resources.
- Plan 010 removes the JavaScript-driven draggable scrollbar and restores native browser scrolling before scroll-linked effects are introduced.

## Scope

- Compose one home-route sequence using real portfolio assets and approved text.
- Add restrained viewport reveal and stagger behavior only where repeated composition needs justify shared primitives.
- Build one native CSS `position: sticky` media/text section.
- Add bounded editorial image drift driven by Motion values from `useScroll`/`useTransform`, without per-frame React state.
- Add locally bounded CSS stacking between the introductory and sticky story, and between the final editorial image and color release.
- Add one purposeful orange, blue, or violet color-release section between darker sequences.
- Disable parallax and large transforms for reduced motion and simplify sticky behavior on constrained layouts when needed.
- Profile fast/reverse scrolling, resize, image decode, and sticky entry/exit in production.

## Non-goals

- Do not add page transitions, shared-element route transitions, synthetic scrolling, wheel interception, video scrubbing, WebGL, or another animation runtime.
- Do not redesign shop/contact, build project-detail routes, or add backend content.
- Do not create generic sticky/parallax frameworks beyond the proven composition.

## Deliverables

- Approved portfolio composition and feature-owned static content.
- Justified reveal/stagger implementation, one sticky section, bounded image drift, and locally bounded stacking treatments.
- Reduced-motion and responsive alternatives.
- Component/E2E coverage plus before/after performance evidence.

## Implementation plan

1. Record the approved image sequence, copy, intended focal points, and current home behavior. Write component/E2E expectations before changing the route.
2. Build the semantic document structure and static responsive layout first, using native sticky positioning and normal document flow.
3. Add reveals and modest staggering with the existing Motion boundary. Content must render visibly before animation features load.
4. Add parallax with element-scoped scroll progress and transform-only displacement. Oversize/crop media enough to prevent exposed edges.
5. Apply reduced-motion alternatives: remove parallax and large movement, preserve opacity/context transitions, and keep every control and content block available.
6. Profile production behavior during slow, aggressive, and reverse scrolling; resize across breakpoints and inspect renders, layout, decode stalls, and long tasks.
7. Remove or simplify effects that materially degrade interaction and record the final measurements.

## Acceptance criteria

- Normal browser scrolling remains authoritative; no wheel, touch, or scroll-position hijacking exists.
- Sticky positioning is CSS-owned and enters/exits correctly in both directions.
- Image drift uses Motion values and transforms without continuous React scroll-state updates.
- Stacked sections are constrained to their local document groups and cannot remain pinned beneath later portfolio content.
- Reduced motion removes parallax and large transforms while preserving all content.
- Mobile/touch layouts remain readable and may use normal flow instead of sticky behavior.
- Initial media loading stays within Plan 005’s established policy and budget.
- Keyboard navigation and gallery access remain functional throughout the composition.
- Profiling shows no unresolved material forced-layout loop, long-task regression, or persistent dropped-frame behavior caused by the new effects.

## Verification

- `npm run check`
- `npm run security:audit`
- `npm run build`
- Cypress component and E2E tests for normal/reduced motion and mobile/desktop composition.
- Production Performance and Network review for slow, fast, and reverse scroll; sticky boundaries; resize; cached/uncached images.

## Risks and recovery

| Risk                                        | Mitigation or recovery                                                             |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Effects compete with photography            | Remove or reduce any motion without a clear hierarchy/story function.              |
| Sticky/parallax breaks mobile flow          | Disable the effect at the affected breakpoint and retain semantic normal flow.     |
| Image decode causes apparent animation jank | Fix media sizing/loading before tuning animation.                                  |
| Shared primitives accumulate flags          | Keep composition-specific behavior local until a stable repeated contract appears. |

## Definition of done

- The approved composition, responsive/reduced-motion alternatives, tests, and profiling satisfy the acceptance criteria.
- All local and CI checks pass, and evidence is recorded.
- The diff remains home-portfolio scope and documentation reflects any enduring rule.
- The PR and plan index contain final status and links.

## Implementation record

In progress. `PortfolioScrollComposition` owns the four approved editorial chapters and feature-owned copy, while `Portfolio` composes it between the existing hero and photo grid. The first and second editorial photographs use element-scoped, transform-only Motion values; their cards overscan to avoid exposed edges. CSS owns the sticky media and two stacking transitions. Both stacking effects are constrained to local wrapper boundaries after an initial global sticky implementation incorrectly left the color release beneath the gallery. Reduced-motion users receive static stacked sections and no image transforms. Visual review approved the final hover, image-drift, and stacking behavior. `npm run check` passed: lint, format, TypeScript, 31 unit tests (100% statements, lines, and functions; 94.54% branches), 20 Cypress component tests, production build, and 11 Cypress E2E journeys. `npm run security:audit` found zero production vulnerabilities. [PR #30](https://github.com/avidixit27/avi-dixit.com/pull/30) is open; CI result will be recorded after review.
