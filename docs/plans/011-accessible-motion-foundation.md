# 011 — Introduce an accessible Motion foundation

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Type           | Feature                                                    |
| Status         | Tracked in the [plan index](README.md)                     |
| Depends on     | 010                                                        |
| Blocks         | 012 and 013                                                |
| Planned branch | `feat/motion-foundation`                                   |
| PR base        | `main`                                                     |
| PR             | [#29](https://github.com/avidixit27/avi-dixit.com/pull/29) |

## Outcome

The narrow footer Motion use from Plan 010 becomes an application-level animation foundation with deferred feature loading, global reduced-motion behavior, and shared timing policy. A weighted end-of-page landing proves the integration. Desktop wheel and trackpad input is replayed at its original distance above the final viewport, then eased toward an accumulated target within that final viewport so high-momentum gestures cannot expose the footer in one frame. Keyboard and touch scrolling remain browser-owned. The shell also gains a controlled warm-orange and violet navigation treatment against the dark canvas.

## Prerequisites and current state

- React 18.2+ and Vite are compatible with Motion without special Vite configuration according to the official [installation guide](https://motion.dev/docs/react-installation).
- Plan 010 supplies stable visual tokens; Plan 005 supplies delivery-sized images so decode cost does not distort motion profiling.
- Plan 010 installs Motion for bounded footer parallax and handles reduced motion locally. Existing hero and lightbox transitions use CSS and timers. Tailwind remains appropriate for simple hover and focus feedback.
- Plan 010 uses warm orange `--color-brand-warm`, vivid violet `--color-brand-vivid`, and pale yellow `--color-focus` semantic tokens. Active navigation and the footer signature currently use the pale-yellow treatment.
- Verify the maintained `motion` release, its production audit, and bundle effect at implementation time. Follow Motion's current [bundle-size](https://motion.dev/docs/react-reduce-bundle-size) and [accessibility](https://motion.dev/docs/react-accessibility) guidance rather than copying stale API examples.

## Scope

- Confirm and record the exact locked `motion` version introduced by Plan 010.
- Add one application-level Motion configuration that respects the operating-system preference with `reducedMotion="user"`.
- Use strict `LazyMotion` with dynamically loaded `domAnimation` features and the slim `m` components. Do not load `domMax` until an implemented layout or drag interaction requires it.
- Define a small shared duration/easing policy using existing token ownership.
- Evolve the existing footer reveal into a pronounced but controlled end-of-page landing inspired by [VIV MGMT](https://vivmgmt.com/). Keep the footer fixed behind the opaque application surface and use an explicit footer-sized flow spacer as its reveal window and local progress target. Move the footer's inner layer modestly while the foreground uncovers it. Keep both layers on the same scroll timeline; do not reproduce VIV's global smooth-scroll runtime.
- Add a footer-owned desktop wheel/trackpad controller. Claim each ordinary downward gesture from its first cancelable event so browser wheel-event latching cannot bypass the ending, replay its distance 1:1 above the final viewport, and use time-based easing only for the portion inside that viewport. Batch writes to one animation frame, release upward reversal immediately, and disable the controller for reduced motion or while the lightbox owns document scrolling.
- Keep the settling effect narrow, responsive, and restrained on mobile. Apply no scroll-linked transform when reduced motion is requested; the complete final section and footer remain immediately available.
- Change the active route label to the existing warm-orange token and the active underline to the existing vivid-violet token. Keep the footer signature in its approved cream, inactive labels muted, and the separate accessible focus treatment.
- Give the enlarged-image close glyph a short CSS color-fill transition from the neutral text color to the same warm orange on hover and `focus-visible`, with an immediate orange pressed state. Disable the transition duration for reduced motion while preserving the state change.
- Record Motion’s isolated JavaScript contribution before and after the proof integration.

## Non-goals

- Do not add parallax to portfolio content, sticky storytelling, page transitions, shared-element transitions, drag gestures, GSAP, or WebGL.
- Do not intercept touch or keyboard input, add an external or page-wide smooth-scroll runtime, or hide the native scrollbar. The approved footer controller is the only exception: it owns ordinary downward desktop wheel input, preserves 1:1 distance above the final viewport, and animates only the remaining final-viewport distance.
- Do not convert simple CSS hover/focus transitions to Motion.
- Do not create a catalog of wrappers, variants, or hooks for hypothetical future effects.

## Deliverables

- Motion dependency and lazy feature boundary.
- Global reduced-motion configuration and shared timing policy.
- One tested end-of-page landing effect with an immediate reduced-motion equivalent.
- Warm-orange active navigation with a vivid-violet active underline and a cream footer signature.
- A warm-orange fill interaction for the lightbox close control.
- Bundle-size and browser-profile evidence.
- Updated architecture documentation; existing repository agent guidance reviewed for continued applicability.

## Implementation plan

1. Capture the production JavaScript baseline and current footer behavior. Record native wheel, trackpad, keyboard, and touch behavior at representative desktop and mobile widths before editing.
2. Audit the installed Motion package and the isolated footer import before broadening its application ownership.
3. Add the strict `LazyMotion`/`MotionConfig` boundary. Keep the feature-loader module narrow and dynamically import `domAnimation`.
4. Protect the current footer content, 1:1 ordinary wheel distance, and reduced-motion result with regression tests. Add focused policy tests for easing, distance splitting, delta-mode normalization, opacity, landing-zone, and settlement boundaries rather than asserting animation-frame timing.
5. Replace the page-global footer mapping with a footer-local reveal spacer. Keep the semantic footer fixed behind the opaque application surface so the foreground edge progressively uncovers it, and map the footer's shallow transform directly to that spacer's progress. The complete footer must not appear before the foreground has moved through the footer-sized reveal distance.
6. Add the bounded downward wheel/trackpad landing controller. Normalize pixel, line, and page deltas; claim the first cancelable event; batch the ordinary portion once per animation frame at 1:1 distance; accumulate the final-viewport portion into a target; and approach that target with a time-based exponential curve. Release upward, modified, horizontal, modal, touch, keyboard, and reduced-motion input immediately.
7. Apply the color trial through the existing semantic tokens: warm orange for the active route label, vivid violet for the active underline, muted text for inactive labels, and the established focus token for visible keyboard focus. Keep the external signature SVG self-contained in its approved cream and protect its fill in a focused asset test.
8. Add the close-glyph color-fill transition with existing Tailwind/CSS utilities. Keep its accessible name, 44px target, safe-area placement, backdrop behavior, and Escape-key behavior unchanged. Cover focus and activation behavior in the existing lightbox component test; review hover and touch states in a real browser.
9. Verify native wheel/trackpad behavior before the landing zone, progressive downward resistance inside it, immediate upward reversal, and unchanged Page Up/Down, Home/End, arrow-key, and touch behavior. Review normal and reduced motion at representative mobile and desktop widths.
10. Measure the new route chunk and profile the landing effect in the production build. Remove unnecessary Motion imports that defeat lazy loading.

## Acceptance criteria

- `motion` is the only general-purpose runtime animation library.
- All Motion components under the provider use the slim `m` entrypoint; strict mode detects accidental full `motion` usage.
- Initial animation features are deferred, and `domMax` is absent.
- Wheel and trackpad distance remains 1:1 before the final landing zone and is replayed on the next animation frame. Inside it, downward input accumulates into a bounded target reached with the documented 75ms time constant. Upward reversal remains immediate.
- Keyboard and touch scrolling remain native throughout. Reduced-motion users bypass both the scroll-linked transform and wheel/trackpad resistance.
- Approaching the final section produces a clearly visible sense of deceleration and a coordinated gentle settlement without making the rest of the page feel delayed, sticky, or resistant. The preceding content and footer remain synchronized, the effect reverses cleanly when scrolling away, and it behaves consistently across pages of different lengths.
- A fast downward gesture cannot expose the full footer before the footer-sized reveal spacer is traversed; the opaque application surface remains the visible mask throughout the approach.
- The landing remains restrained and responsive on mobile, introduces no horizontal overflow, and never obscures or delays footer content.
- Reduced-motion users receive the complete final section and footer without scroll-linked transform motion.
- The active route label uses warm orange, its underline uses vivid violet, and the footer signature remains cream. Inactive labels remain muted and keyboard focus stays clearly visible.
- The lightbox close glyph fills with warm orange on hover and keyboard focus and shows orange while pressed on touch/pointer input. Its state remains clear with reduced motion, and its hit target, placement, and closing behavior do not change.
- The proof animation remains usable and never hides content when features load slowly or fail to animate.
- Existing hero timing, gallery opening, keyboard behavior, native scrolling, and cleanup tests continue to pass.
- Bundle growth is measured and recorded rather than assumed.

## Verification

- `npm run check`
- `npm run security:audit`
- `npm run build`
- Compare pre/post JavaScript chunks and confirm the feature bundle is deferred.
- Review normal and reduced motion, slow CPU, rapid scroll reversal, navigation away, and back/forward restoration.
- Manually exercise wheel and trackpad scrolling before and within the final approach, including one high-momentum gesture and immediate reversal. Confirm keyboard, touch, modal, and reduced-motion scrolling remain unmodified.
- Review the orange active label, violet underline, and cream signature against `#0e0e0e` for contrast, balance, and focus-state clarity before final approval.
- Open the lightbox on desktop and mobile and review the close control with pointer hover, keyboard focus, press/tap, reduced motion, safe-area insets, and both bright and dark photographs.

## Risks and recovery

| Risk                                          | Mitigation or recovery                                                                                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A normal `motion` import defeats lazy loading | Use strict `LazyMotion`, lint/review imports, and fail tests on provider errors.                                                                            |
| Deferred features flash or hide content       | Render semantic content by default and treat animation as enhancement.                                                                                      |
| Landing resistance feels heavy or traps input | Bound easing to the final viewport, use the approved 75ms time constant, and release upward input.                                                          |
| A non-passive wheel listener adds page cost   | Keep one constant-time handler, batch writes to one frame, avoid React state, and remove the controller if profiling or field feedback shows missed frames. |
| Color accents overwhelm the photographs       | Limit orange and violet to the approved roles and review them with varied images.                                                                           |
| Motion adds cost without product value        | Keep one proof use, measure it, and revert the dependency if the result is unjustified.                                                                     |

## Definition of done

- The provider, landing effect, color treatment, tests, reduced-motion behavior, and evidence satisfy the acceptance criteria.
- All local and CI checks pass, and no production advisory is introduced.
- Documentation reflects actual Motion ownership and imports.
- The PR and plan index contain final status and links.

## Implementation record

- Motion remains locked at `13.2.0`. The application now uses strict `LazyMotion`, a dynamically imported `domAnimation` feature module, slim `m` components, `reducedMotion="user"`, and one shared transition policy.
- The footer is fixed behind the opaque application surface and revealed through an explicit footer-height flow spacer. Its inner presentation maps that local progress linearly from a 20% offset and 0.94 opacity to its settled state.
- The desktop landing controller normalizes wheel units, batches ordinary distance once per animation frame, and eases only the final viewport toward an accumulated target with `FOOTER_LANDING_TIME_CONSTANT_MS = 75`. Upward, modified, horizontal, modal, touch, keyboard, and reduced-motion paths remain outside the effect.
- Navigation uses warm orange for the active label and vivid violet for its underline. The signature remains cream. The lightbox close glyph uses the warm-orange hover, focus-visible, and pressed treatment without changing its accessible target or dismissal behavior.
- Focused unit and Cypress component coverage protects the provider policy, footer math and cleanup, navigation colors, signature fill, and lightbox close states. The implementation was developed through repeated browser review with slow, fast, from-top, and reverse scrolling; the final desktop treatment and responsive visuals were approved on 2026-09-10.
- Plan 010's direct Motion import produced a 314.09 KB / 103.21 KB gzip entry chunk. The final Plan 011 production build reduces the entry to 239.23 KB / 80.48 KB gzip and defers `domAnimation` to a 33.55 KB / 12.59 KB gzip chunk.
- The global non-passive desktop wheel listener moves wheel scrolling onto a constant-time main-thread path and may add up to one animation frame of input latency above the landing zone. It performs no React state updates and runs no permanent animation loop. Image loading, decoding, responsive sources, and gallery caching are unchanged. Remove the controller while retaining the visual reveal if profiling or production feedback shows missed frames or perceptible general-page lag.
- Local verification passed focused policy tests, lint, type checking, formatting, 100% statement/line/function and 94.54% branch unit coverage, all 19 Cypress component tests, and all 10 production E2E journeys. The footer E2E regression now derives the runtime viewport and contains no hard-coded viewport-height assumption, arbitrary delay, or DOM mutation inside a retry callback. PR #29 passed lint/format/types, unit, component, production build/E2E, dependency review, production audit, CodeQL, and Cloudflare build checks on 2026-09-11.
