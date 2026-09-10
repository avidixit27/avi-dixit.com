# 010 — Establish the dark visual system and application shell

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Type           | Feature                                                    |
| Status         | In review                                                  |
| Depends on     | 009                                                        |
| Blocks         | 011 and visual feature work                                |
| Planned branch | `feat/dark-visual-system`                                  |
| PR base        | `main`                                                     |
| PR             | [#27](https://github.com/avidixit27/avi-dixit.com/pull/27) |

## Outcome

The application has a coherent dark-first visual language derived from the Avi Dixit identity. Semantic tokens, typography, spacing, containers, focus treatment, and the shared shell provide stable inputs for later motion and page composition.

## Prerequisites and current state

- Plans 007–009 provide Tailwind 4, the final asset/font conventions, responsive regression protection, and the meaningful unit-coverage gate.
- The branch now has semantic dark-theme roles for the approved canvas, surfaces, text, borders, focus, and restrained logo accents.
- The orange, blue, and violet logo colors remain controlled accents rather than default large surfaces.
- The footer renders only `Copyright @Avi Dixit 2026`; Contact retains the shared email and Instagram destinations.
- The branch has removed the JavaScript draggable scrollbar and restored native scrolling with restrained CSS styling.
- The approved canvas color is `#0e0e0e`.
- The footer uses `src/assets/icons/avi-signature-logo.svg` from Plan 008 in `#FFE193`, subject only to a documented lighter contrast adjustment if browser review requires it.
- The 16rem footer is fixed behind the application surface and moves through a bounded Motion transform at a slower rate than native document scrolling. Its complete signature remains visible without horizontal overflow.
- Zina Regular supplies display and brand typography without synthetic bold. Inter Regular supplies the footer copyright and the approved supporting copy and links on Contact and Shop.
- Eleven `vite-imagetools cannot find image with requested id` messages did not reproduce from a fresh Vite process and browser session. The evidence supports stale development-session state, so no permanent configuration workaround was added.

## Scope

- Define semantic color tokens for surfaces, text, borders, focus, and controlled brand accents.
- Define typography roles, spacing rhythm, content widths, section spacing, radii, shadows, and layer ordering.
- Make the existing application shell and routes usable in the dark theme at mobile through wide-desktop sizes.
- Keep Tailwind responsible for layout, typography, responsive behavior, and simple hover/focus transitions.
- Centralize stable design values in Tailwind/CSS tokens; remove touched floating color and timing values.
- Remove the custom draggable scrollbar and the CSS that hides the platform scrollbar. Preserve ordinary keyboard, pointer, touch, and assistive-technology scrolling; style the native scrollbar only where browser support and contrast remain sound.
- Replace Zen Tokyo Zoo with Zina Regular anywhere the display token or outlined wordmark lettering is used. Preserve the official Zina font file and license without format conversion.
- Keep email and Instagram in the shared site resource for the Contact route, but render only the copyright in the footer. Use Inter Regular at exactly 10px and place the copy at the bottom-right safe edge.
- Keep the footer approximately 2.25 times its former height. Fit the complete signature SVG inside its bounds at every supported width without clipping or horizontal document overflow.
- Replace the stationary footer reveal with a bounded Motion scroll transform at mobile through wide-desktop sizes. Native document scrolling remains at browser speed; one owner-local rate constant controls the footer's relative motion and reduced motion removes the transform.
- Diagnose the local `vite-imagetools` ID messages from a clean start. Prefer documented cache/session recovery when the fault is stale development state; change application or Vite configuration only if the error reproduces from a clean cache and fresh browser session.
- Document where saturated orange, blue, or violet surfaces are appropriate and where neutral presentation should dominate.

## Non-goals

- Do not add entrance, route, gallery, or general layout animation. The footer parallax is the only Motion behavior admitted to this PR.
- Do not redesign every feature’s information architecture.
- Do not choose a backend, hosting provider, CMS, checkout, or contact-delivery service.
- Do not convert or modify Zina font software, synthesize an unavailable Zina weight, or broaden Inter beyond the approved footer, Contact, and Shop copy in this task.

## Deliverables

- Semantic Tailwind/CSS tokens and documented usage rules.
- Updated global base styles, focus treatment, shared layout primitives, and application shell.
- Responsive visual treatment for current portfolio, shop, and contact states.
- A shared parallax footer with copyright-only content and fully visible signature artwork.
- Self-hosted Zina Regular and Inter Regular assets with their respective license files; no Zen Tokyo Zoo production use remains.
- An outlined Zina wordmark whose text color matches the approved navigation color without depending on runtime font loading.
- A verified resolution or documented local recovery for the `vite-imagetools` development-session errors.
- Native document scrolling without the JavaScript draggable scrollbar.
- Cypress coverage for navigation/footer semantics and visual review evidence.

## Implementation plan

1. Inventory current colors, hard-coded values, typography, widths, layers, and interactive states. Extract the logo palette and test candidate text/background pairings for contrast.
2. Define semantic CSS variables through the Tailwind 4 CSS-first theme, using `#0e0e0e` for the canvas and roles rather than raw brand colors in components.
3. Add tests that initially fail for Zina display ownership, the footer's copyright-only content, 10px Inter treatment, approved parallax policy, and reduced motion. Protect signature containment and a clean image-transform session at the browser level, where those behaviors are observable.
4. Copy the official `Zina-Regular.otf`, Zina FFL, `Inter-Regular.woff2`, and Inter OFL into `src/assets/fonts/` with unambiguous names. Update the display token globally to Zina and add an Inter token for the footer and approved Contact and Shop supporting copy. Remove Zen Tokyo Zoo and its license only after all imports and fallbacks are gone.
5. Rebuild the wordmark text as Zina Regular vector outlines while preserving the circular photographic mark, dimensions, accessible image label, and intrinsic aspect ratio. Set the wordmark to the muted navigation color `#BBB4A9`, align its lettering with the navigation-label line, keep active navigation on the existing focus token `#FFE193`, and keep inactive navigation muted with the focus token on hover/focus. Apply `#BBB4A9` directly to the wordmark paths so the external SVG does not depend on page CSS.
6. Preserve email and Instagram in `SITE_DETAILS` for Contact, remove both links from `Footer`, and anchor the copyright at the bottom-right safe edge in Inter Regular. Define `--text-footer-copy: 0.625rem` in `src/index.css` as the single 10px source of truth.
7. Adjust the signature geometry and presentation so its entire SVG view box remains visible within the footer at mobile through wide desktop widths. Remove the intentional negative bottom/left cropping and protect horizontal overflow.
8. Install the maintained `motion` package and implement only the footer's scroll-linked transform with `useScroll`/`useTransform` or the smallest equivalent Motion API. Apply it from mobile through wide desktop without separate viewport implementations. Keep native document scrolling, define `FOOTER_PARALLAX_RATE = 0.3` in a narrow `src/app/footerPresentationPolicy.ts`, and render a no-transform equivalent for reduced-motion users. Protect the approved value in its unit test so the tuning point is explicit and deliberate.
9. Reproduce the image-ID issue with the existing development session, then compare a stopped/restarted Vite server, a hard browser reload, and fresh Vite/imagetools caches. If a clean start resolves it, document the recovery and avoid new scripts or config. If it recurs cleanly, isolate the `import.meta.glob` query or plugin lifecycle cause and add the smallest verified correction.
10. Review the full page and footer with real photographs at representative widths. Record the production bundle delta from Zina, Inter, and Motion, and ensure the narrow Motion import does not pull unrelated features.

## Acceptance criteria

- The default experience is dark-first, with readable text and visible keyboard focus meeting WCAG AA contrast for normal text and controls.
- The canvas resolves to `#0e0e0e` from one semantic token.
- Orange, blue, and violet are semantic accents used intentionally; large saturated surfaces are exceptional.
- Components consume semantic tokens rather than newly introducing repeated raw colors or spacing values.
- Current routes remain usable from 390 px mobile through wide desktop layouts.
- Simple interactive feedback remains CSS/Tailwind based.
- All HTML display text and the outlined wordmark use Zina Regular without synthesized bold; no Zen Tokyo Zoo import, file, fallback, or license remains. The official Zina OTF and FFL are preserved without modification.
- Wordmark text uses the muted navigation color `#BBB4A9` and aligns with the navigation-label line. Active navigation uses `#FFE193` through the focus semantic role. Inactive navigation remains muted and changes to the same focus color on hover or keyboard focus. The circular photographic portion of the wordmark remains unchanged.
- The footer renders no email or Instagram link. Its only text is `Copyright @Avi Dixit 2026`, set in Inter Regular at 10px and aligned to the bottom-right safe edge.
- Contact supporting copy, email, and Instagram and the Shop supporting summary use Inter Regular.
- The complete signature is visible within the footer from 390px through wide desktop layouts and introduces no horizontal scrolling.
- The footer moves perceptibly slower than the native scrolling surface during reveal from 390px mobile through wide desktop, reaches its intended final position, reverses smoothly, and does not jump during route or viewport changes.
- `FOOTER_PARALLAX_RATE` is the single documented footer speed control. The page continues at native browser speed and has no separate background-rate constant.
- Reduced-motion users receive the complete footer without a scroll-linked transform.
- A clean development start and browser session load all responsive photos without `vite-imagetools cannot find image with requested id` messages. Any cache-only recovery is documented without adding permanent maintenance machinery.
- The native scrollbar remains usable by keyboard, pointer, touch, and assistive technology; no JavaScript scroll-position mirroring or draggable replacement remains.
- The latest two stable Chrome, Edge, Firefox, and Safari releases, including current iOS Safari, receive a complete usable experience.
- Motion is the only runtime added, and its use in this PR is limited to footer parallax.

## Verification

- `npm run check`
- `npm run security:audit`
- `npm run build`
- Review all current routes at mobile, tablet, laptop, desktop, and wide-desktop widths.
- Review keyboard focus, hover, touch targets, contrast, long text, and slow image loading.
- Start Vite from a cold process, hard-reload the portfolio, navigate all routes, and confirm the terminal and browser console contain no missing imagetools IDs.
- Review the complete signature, bottom-right copyright, and parallax at 390px, tablet, 1280px, and wide desktop sizes with normal and reduced motion.
- Compare production JavaScript and font assets before and after the follow-up.

## Risks and recovery

| Risk                                                  | Mitigation or recovery                                                                                                           |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Dark styling obscures image detail or controls        | Review representative bright and dark photographs and strengthen local contrast where needed.                                    |
| Tokens become a second utility framework              | Keep only recurring semantic roles and use Tailwind’s existing scale for ordinary values.                                        |
| Contact destinations drift                            | Keep email and Instagram in the typed site resource even though the footer no longer renders them.                               |
| Native scrollbar styling reduces usability            | Prefer platform defaults; remove styling that weakens visibility, contrast, or input behavior.                                   |
| Broad restyling masks behavior regressions            | Migrate by owner and keep existing component/E2E journeys passing.                                                               |
| Parallax obscures content or causes motion discomfort | Bound the transform, preserve native scrolling, remove it for reduced motion, and retain complete footer content without Motion. |
| Signature is cropped or causes horizontal overflow    | Fit its complete intrinsic view box within the footer and test narrow and wide viewport scroll widths.                           |
| Zina web delivery violates its license                | Serve the official OTF unchanged, retain the FFL, and do not convert or subset the font.                                         |
| Stale imagetools state prompts unnecessary config     | Compare a clean process/cache/browser before changing the pipeline; document a local recovery when no clean defect reproduces.   |

## Definition of done

- The theme, shell, current routes, and approved footer satisfy the acceptance criteria.
- Automated checks and responsive/accessibility review pass and are recorded.
- Architecture and agent guidance reflect the implemented visual system.
- The PR and plan index contain final status and links.

## Implementation record

Restacked onto `main` after Plans 007–009 merged. The implementation establishes the `#0e0e0e` canvas and semantic surface, text, border, focus, spacing, and accent tokens. It removes the JavaScript scrollbar in favor of native scrolling and applies the shared visual system across the current routes.

Zina Regular now owns display and brand typography, including the outlined wordmark. Inter Regular owns the 10px footer copyright and the approved Contact and Shop supporting copy and links. The wordmark uses `#BBB4A9`, aligns with the navigation labels, and retains the original circular photograph. The 16rem footer shows the complete signature, clears the native scrollbar and safe-area edge, and uses `FOOTER_PARALLAX_RATE = 0.3` for its bounded Motion transform. Reduced motion removes that transform. A fresh development process and browser session did not reproduce the reported imagetools IDs, so no configuration workaround was introduced.

The accepted direct Motion implementation increased the production entry bundle from 185.33 KB / 61.62 KB gzip to 314.09 KB / 103.21 KB gzip, a 128.76 KB / 41.59 KB gzip delta. Plan 011 owns the `LazyMotion` and feature-loading audit; this measured follow-up does not block Plan 010. Product review approved representative local desktop and mobile layouts. Automated browser coverage currently runs in Chrome; dedicated Firefox and Safari matrix coverage remains future hardening.

Final verification at commit `ca1cc60` passed `npm run check` (21 unit tests with 100% statements/functions/lines and 92.85% branches, 18 component tests, and 10 production browser tests), `npm run security:audit` with zero production vulnerabilities, and `npm run build`. All GitHub checks passed, including lint/format/types, unit, component, production build/browser tests, production audit, dependency review, CodeQL, and the Cloudflare Workers build.

The documentation follow-up exposed a CI race in the footer E2E test: it compared the bottom position with a pixel coordinate captured before asynchronous page work settled. The regression test now reasserts the current document bottom during Cypress retries and verifies the observable parallax states directly: a positive bounded offset at the top, zero transform and visible content at the bottom, and the restored offset after returning to the top. The complete production E2E spec passed three consecutive local runs after this correction.
