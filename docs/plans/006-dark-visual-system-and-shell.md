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
- Confirm the footer’s actual email, social destinations, copyright name, and required legal links before rendering them. Do not publish invented or placeholder contact details.

## Scope

- Define semantic color tokens for surfaces, text, borders, focus, and controlled brand accents.
- Define typography roles, spacing rhythm, content widths, section spacing, radii, shadows, and layer ordering.
- Make the existing application shell and routes usable in the dark theme at mobile through wide-desktop sizes.
- Keep Tailwind responsible for layout, typography, responsive behavior, and simple hover/focus transitions.
- Centralize stable design values in Tailwind/CSS tokens; remove touched floating color and timing values.
- Add the shared footer once approved static content is available, storing immutable copy and destinations in the appropriate resource catalog.
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
- A shared footer with approved content, or an explicitly recorded content blocker.
- Cypress coverage for navigation/footer semantics and visual review evidence.

## Implementation plan

1. Inventory current colors, hard-coded values, typography, widths, layers, and interactive states. Extract the logo palette and test candidate text/background pairings for contrast.
2. Define semantic CSS variables and map Tailwind names to them so components consume roles rather than raw brand colors.
3. Establish display/body/meta typography, spacing, containers, section rhythm, border, focus, radius, shadow, and layer tokens. Use the current system font stack until typography licensing is decided.
4. Migrate global styles and the application shell, then update current routes in coherent slices. Preserve behavior while replacing touched floating values.
5. Implement the footer only from approved resource data. Ensure keyboard order, visible focus, external-link behavior, and small-screen wrapping are deliberate.
6. Add component assertions for semantics and state classes where useful, then review real images and content at representative sizes.

## Acceptance criteria

- The default experience is dark-first, with readable text and visible keyboard focus meeting WCAG AA contrast for normal text and controls.
- Orange, blue, and violet are semantic accents used intentionally; large saturated surfaces are exceptional.
- Components consume semantic tokens rather than newly introducing repeated raw colors or spacing values.
- Current routes remain usable from 390 px mobile through wide desktop layouts.
- Simple interactive feedback remains CSS/Tailwind based.
- Footer content is accurate, reachable by normal document scrolling, keyboard accessible, and stored as static resource data.
- No Motion dependency or runtime animation is introduced.

## Verification

- `npm run check`
- `npm run security:audit`
- `npm run build`
- Review all current routes at mobile, tablet, laptop, desktop, and wide-desktop widths.
- Review keyboard focus, hover, touch targets, contrast, long text, and slow image loading.

## Risks and recovery

| Risk                                           | Mitigation or recovery                                                                        |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Dark styling obscures image detail or controls | Review representative bright and dark photographs and strengthen local contrast where needed. |
| Tokens become a second utility framework       | Keep only recurring semantic roles and use Tailwind’s existing scale for ordinary values.     |
| Footer publishes incorrect data                | Block its content slice until destinations are approved; do not invent placeholders.          |
| Broad restyling masks behavior regressions     | Migrate by owner and keep existing component/E2E journeys passing.                            |

## Definition of done

- The theme, shell, current routes, and approved footer satisfy the acceptance criteria.
- Automated checks and responsive/accessibility review pass and are recorded.
- Architecture and agent guidance reflect the implemented visual system.
- The PR and plan index contain final status and links.

## Implementation record

Not started. Record final tokens, contrast decisions, approved footer resources, responsive review, commands, CI evidence, limitations, and PR link.
