# 006 — Establish the dark visual system and application shell

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| Type           | Feature                                |
| Status         | Tracked in the [plan index](README.md) |
| Depends on     | 005                                    |
| Blocks         | 007 and visual feature work            |
| Planned branch | `feat/dark-visual-system`              |
| PR base        | `feat/responsive-media-foundation`     |
| PR             | Not opened                             |

## Outcome

The application has a coherent dark-first visual language derived from the Avi Dixit identity. Semantic tokens, typography, spacing, containers, focus treatment, and the shared shell provide stable inputs for later motion and page composition.

## Prerequisites and current state

- Plan 005 provides responsive real-image assets for visual review.
- The current Tailwind theme uses presentation-oriented names such as `primary`, `accent`, and `ink`, and the application defaults to a light canvas.
- The orange, blue, and violet logo colors are candidates; their accessible semantic uses must be derived and tested rather than copied indiscriminately.
- Approved initial footer resources are `avidixit27@gmail.com`, [Instagram](https://www.instagram.com/_avid.photography_/), and the display copy `Copyright @Avi Dixit 2026`. No legal links are required in this initial footer.
- The current shell hides the native browser scrollbar and renders a JavaScript-driven draggable substitute. The approved direction is to remove that component and restore native scrolling with optional restrained CSS styling.

## Scope

- Define semantic color tokens for surfaces, text, borders, focus, and controlled brand accents.
- Define typography roles, spacing rhythm, content widths, section spacing, radii, shadows, and layer ordering.
- Make the existing application shell and routes usable in the dark theme at mobile through wide-desktop sizes.
- Keep Tailwind responsible for layout, typography, responsive behavior, and simple hover/focus transitions.
- Migrate Tailwind 3 to Tailwind 4 in this plan, adapting the design-token configuration once and protecting current output before applying the new dark visual system.
- Centralize stable design values in Tailwind/CSS tokens; remove touched floating color and timing values.
- Remove the custom draggable scrollbar and the CSS that hides the platform scrollbar. Preserve ordinary keyboard, pointer, touch, and assistive-technology scrolling; style the native scrollbar only where browser support and contrast remain sound.
- Add the shared footer using the approved email, Instagram destination, and copyright copy, storing immutable copy and destinations in the appropriate resource catalog.
- Document where saturated orange, blue, or violet surfaces are appropriate and where neutral presentation should dominate.

## Non-goals

- Do not install Motion or implement entrance, scroll, parallax, route, or layout animation.
- Do not redesign every feature’s information architecture.
- Do not choose a backend, hosting provider, CMS, checkout, or contact-delivery service.
- Do not add a custom font without a separate licensing and loading decision.

## Deliverables

- Semantic Tailwind/CSS tokens and documented usage rules.
- Updated global base styles, focus treatment, shared layout primitives, and application shell.
- Responsive visual treatment for current portfolio, shop, and contact states.
- A shared footer with approved content.
- Native document scrolling without the JavaScript draggable scrollbar.
- Cypress coverage for navigation/footer semantics and visual review evidence.

## Implementation plan

1. Inventory current colors, hard-coded values, typography, widths, layers, and interactive states. Extract the logo palette and test candidate text/background pairings for contrast.
2. Protect current rendering and class behavior, then follow Tailwind's official major-version migration for the package, PostCSS integration, CSS entrypoint, content discovery, and theme values. Verify visual parity before introducing the dark system.
3. Define semantic CSS variables and map Tailwind names to them so components consume roles rather than raw brand colors.
4. Establish display/body/meta typography, spacing, containers, section rhythm, border, focus, radius, shadow, and layer tokens. Use the current system font stack until typography licensing is decided.
5. Remove `CustomScrollbar` from the application shell and restore the native scrollbar. Remove its listeners, timers, DOM writes, and hidden-scrollbar rules; add only restrained native scrollbar styling that preserves visibility and platform behavior.
6. Migrate global styles and the remaining application shell, then update current routes in coherent slices. Preserve behavior while replacing touched floating values.
7. Implement the footer from approved resource data. Ensure keyboard order, visible focus, email/Instagram behavior, external-link security attributes, and small-screen wrapping are deliberate.
8. Add component assertions for semantics and state classes where useful, then review real images and content at representative sizes and supported browsers.

## Acceptance criteria

- The default experience is dark-first, with readable text and visible keyboard focus meeting WCAG AA contrast for normal text and controls.
- Orange, blue, and violet are semantic accents used intentionally; large saturated surfaces are exceptional.
- Components consume semantic tokens rather than newly introducing repeated raw colors or spacing values.
- Current routes remain usable from 390 px mobile through wide desktop layouts.
- Simple interactive feedback remains CSS/Tailwind based.
- Footer content is accurate, reachable by normal document scrolling, keyboard accessible, and stored as static resource data.
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

| Risk                                           | Mitigation or recovery                                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Tailwind migration and redesign fail together  | Establish Tailwind 4 visual parity first, then apply token and theme changes in protected slices. |
| Dark styling obscures image detail or controls | Review representative bright and dark photographs and strengthen local contrast where needed.     |
| Tokens become a second utility framework       | Keep only recurring semantic roles and use Tailwind’s existing scale for ordinary values.         |
| Footer destinations drift                      | Keep approved values in one typed resource catalog and update them through a scoped change.       |
| Native scrollbar styling reduces usability     | Prefer platform defaults; remove styling that weakens visibility, contrast, or input behavior.    |
| Broad restyling masks behavior regressions     | Migrate by owner and keep existing component/E2E journeys passing.                                |

## Definition of done

- The theme, shell, current routes, and approved footer satisfy the acceptance criteria.
- Automated checks and responsive/accessibility review pass and are recorded.
- Architecture and agent guidance reflect the implemented visual system.
- The PR and plan index contain final status and links.

## Implementation record

Not started. Record final tokens, contrast decisions, scrollbar removal, approved footer resources, cross-browser review, commands, CI evidence, limitations, and PR link.
