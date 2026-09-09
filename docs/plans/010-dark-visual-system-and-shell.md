# 010 — Establish the dark visual system and application shell

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| Type           | Feature                                |
| Status         | Tracked in the [plan index](README.md) |
| Depends on     | 009                                    |
| Blocks         | 011 and visual feature work            |
| Planned branch | `feat/dark-visual-system`              |
| PR base        | `test/unit-coverage-quality-gate`      |
| PR             | Not opened                             |

## Outcome

The application has a coherent dark-first visual language derived from the Avi Dixit identity. Semantic tokens, typography, spacing, containers, focus treatment, and the shared shell provide stable inputs for later motion and page composition.

## Prerequisites and current state

- Plans 007–009 provide Tailwind 4, the final asset/font conventions, responsive regression protection, and the meaningful unit-coverage gate.
- The current Tailwind theme uses presentation-oriented names such as `primary`, `accent`, and `ink`, and the application defaults to a light canvas.
- The orange, blue, and violet logo colors are candidates; their accessible semantic uses must be derived and tested rather than copied indiscriminately.
- Approved initial footer resources are `avidixit27@gmail.com`, [Instagram](https://www.instagram.com/_avid.photography_/), and the display copy `Copyright @Avi Dixit 2026`. No legal links are required in this initial footer.
- The current shell hides the native browser scrollbar and renders a JavaScript-driven draggable substitute. The approved direction is to remove that component and restore native scrolling with optional restrained CSS styling.
- The approved canvas color is `#0e0e0e`.
- The footer uses `src/assets/brand/avi-signature-logo.svg` from Plan 008 in `#FFE193`, subject only to a documented lighter contrast adjustment if browser review requires it.
- The approved footer behavior is a native sticky reveal: the footer remains stationary beneath the scrolling page surface, is revealed as content scrolls past it, and recedes naturally when the user scrolls away.

## Scope

- Define semantic color tokens for surfaces, text, borders, focus, and controlled brand accents.
- Define typography roles, spacing rhythm, content widths, section spacing, radii, shadows, and layer ordering.
- Make the existing application shell and routes usable in the dark theme at mobile through wide-desktop sizes.
- Keep Tailwind responsible for layout, typography, responsive behavior, and simple hover/focus transitions.
- Centralize stable design values in Tailwind/CSS tokens; remove touched floating color and timing values.
- Remove the custom draggable scrollbar and the CSS that hides the platform scrollbar. Preserve ordinary keyboard, pointer, touch, and assistive-technology scrolling; style the native scrollbar only where browser support and contrast remain sound.
- Add the shared footer using the approved email, Instagram destination, and copyright copy, storing immutable copy and destinations in the appropriate resource catalog.
- Make the footer approximately 2.25 times its current height. Scale the signature to use the available footer height and offset its leftmost diagonal stroke beyond the left viewport edge without causing horizontal document overflow.
- Implement the footer reveal with native layout/sticky positioning and normal document scrolling. Preserve readable normal flow where constrained mobile layouts cannot support the full effect.
- Document where saturated orange, blue, or violet surfaces are appropriate and where neutral presentation should dominate.

## Non-goals

- Do not install Motion or implement entrance, scroll, parallax, route, or layout animation.
- Do not redesign every feature’s information architecture.
- Do not choose a backend, hosting provider, CMS, checkout, or contact-delivery service.
- Do not add or change fonts; Plan 008 owns the licensed Zen Tokyo Zoo decision and implementation.

## Deliverables

- Semantic Tailwind/CSS tokens and documented usage rules.
- Updated global base styles, focus treatment, shared layout primitives, and application shell.
- Responsive visual treatment for current portfolio, shop, and contact states.
- A shared sticky-reveal footer with approved content and signature artwork.
- Native document scrolling without the JavaScript draggable scrollbar.
- Cypress coverage for navigation/footer semantics and visual review evidence.

## Implementation plan

1. Inventory current colors, hard-coded values, typography, widths, layers, and interactive states. Extract the logo palette and test candidate text/background pairings for contrast.
2. Define semantic CSS variables through the Tailwind 4 CSS-first theme, using `#0e0e0e` for the canvas and roles rather than raw brand colors in components.
3. Establish display/body/meta typography, spacing, containers, section rhythm, border, focus, radius, shadow, and layer tokens while preserving Plan 008's Zen Tokyo Zoo display token.
4. Remove `CustomScrollbar` from the application shell and restore the native scrollbar. Remove its listeners, timers, DOM writes, and hidden-scrollbar rules; add only restrained native scrollbar styling that preserves visibility and platform behavior.
5. Migrate global styles and the remaining application shell, then update current routes in coherent slices. Preserve behavior while replacing touched floating values.
6. Implement the footer from approved resource data as a native sticky reveal beneath the scrolling page surface. Ensure keyboard order, visible focus, email/Instagram behavior, external-link security attributes, and small-screen wrapping are deliberate.
7. Size the footer to approximately 2.25 times its prior height. Render the signature at the left in `#FFE193`, use the footer height, offset the first diagonal stroke beyond the viewport, and prevent horizontal overflow. Compare a lighter signature only if `#FFE193` lacks sufficient contrast in context.
8. Add component assertions for semantics and state classes where useful, then review real images, scrolling behavior, and content at representative sizes and supported browsers.

## Acceptance criteria

- The default experience is dark-first, with readable text and visible keyboard focus meeting WCAG AA contrast for normal text and controls.
- The canvas resolves to `#0e0e0e` from one semantic token.
- Orange, blue, and violet are semantic accents used intentionally; large saturated surfaces are exceptional.
- Components consume semantic tokens rather than newly introducing repeated raw colors or spacing values.
- Current routes remain usable from 390 px mobile through wide desktop layouts.
- Simple interactive feedback remains CSS/Tailwind based.
- Footer content is accurate, reachable by normal document scrolling, keyboard accessible, and stored as static resource data.
- On supported desktop layouts the stationary footer is revealed beneath scrolling content and recedes correctly in reverse. Mobile retains complete normal-flow content when the reveal would reduce usability.
- The signature uses the approved warm color, fills the intended footer scale, begins beyond the left viewport edge, and introduces no horizontal scrolling.
- The native scrollbar remains usable by keyboard, pointer, touch, and assistive technology; no JavaScript scroll-position mirroring or draggable replacement remains.
- The latest two stable Chrome, Edge, Firefox, and Safari releases, including current iOS Safari, receive a complete usable experience.
- No Motion dependency or runtime animation is introduced.

## Verification

- `npm run check`
- `npm run security:audit`
- `npm run build`
- Review all current routes at mobile, tablet, laptop, desktop, and wide-desktop widths.
- Review keyboard focus, hover, touch targets, contrast, long text, and slow image loading.

## Risks and recovery

| Risk                                              | Mitigation or recovery                                                                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Dark styling obscures image detail or controls    | Review representative bright and dark photographs and strengthen local contrast where needed.                                      |
| Tokens become a second utility framework          | Keep only recurring semantic roles and use Tailwind’s existing scale for ordinary values.                                          |
| Footer destinations drift                         | Keep approved values in one typed resource catalog and update them through a scoped change.                                        |
| Native scrollbar styling reduces usability        | Prefer platform defaults; remove styling that weakens visibility, contrast, or input behavior.                                     |
| Broad restyling masks behavior regressions        | Migrate by owner and keep existing component/E2E journeys passing.                                                                 |
| Sticky reveal obscures content or fails on mobile | Keep normal document flow semantic, reserve sufficient page/footer space, and fall back to normal flow at constrained breakpoints. |
| Oversized signature causes horizontal overflow    | Clip within the footer presentation boundary and test narrow and wide viewport scroll widths.                                      |

## Definition of done

- The theme, shell, current routes, and approved footer satisfy the acceptance criteria.
- Automated checks and responsive/accessibility review pass and are recorded.
- Architecture and agent guidance reflect the implemented visual system.
- The PR and plan index contain final status and links.

## Implementation record

Started September 6, 2026, from the merged Plan 005 baseline on `main`, then paused for Plans 007–009 after PR #23 changed the build baseline. The working implementation is preserved for restacking. Record final tokens, contrast decisions, scrollbar removal, footer reveal/signature treatment, cross-browser review, commands, CI evidence, limitations, and PR link.
