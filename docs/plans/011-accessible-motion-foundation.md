# 011 — Introduce an accessible Motion foundation

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| Type           | Feature                                |
| Status         | Tracked in the [plan index](README.md) |
| Depends on     | 010                                    |
| Blocks         | 012 and 013                            |
| Planned branch | `feat/motion-foundation`               |
| PR base        | `main`                                 |
| PR             | Not opened                             |

## Outcome

The narrow footer Motion use from Plan 010 becomes an application-level animation foundation with deferred feature loading, global reduced-motion behavior, and shared timing policy. A subtle eased end-of-page landing proves the integration while native scrolling remains immediate and fully browser-owned. The shell also gains a controlled warm-orange and violet accent treatment so active navigation and the footer carry more color against the dark canvas.

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
- Evolve the existing footer reveal into a subtle eased end-of-page landing. Create the perception of deceleration with a bounded scroll-linked transform, spacing, opacity, or layered motion while preserving the browser's exact scroll position and input response.
- Keep the settling effect narrow, responsive, and restrained on mobile. Apply no scroll-linked transform when reduced motion is requested; the complete final section and footer remain immediately available.
- Change the active route label to the existing warm-orange token, the active underline to the existing vivid-violet token, and the footer signature artwork to the same warm orange. Keep inactive labels muted and preserve the separate accessible focus treatment.
- Record Motion’s isolated JavaScript contribution before and after the proof integration.

## Non-goals

- Do not add parallax to portfolio content, sticky storytelling, page transitions, shared-element transitions, drag gestures, GSAP, or WebGL.
- Do not intercept wheel or touch events, rewrite scroll deltas, animate `scrollTop`, add global smooth/inertial-scroll behavior, or hide the native scrollbar.
- Do not convert simple CSS hover/focus transitions to Motion.
- Do not create a catalog of wrappers, variants, or hooks for hypothetical future effects.

## Deliverables

- Motion dependency and lazy feature boundary.
- Global reduced-motion configuration and shared timing policy.
- One tested end-of-page landing effect with an immediate reduced-motion equivalent.
- Warm-orange active navigation and footer signature accents with a vivid-violet active underline.
- Bundle-size and browser-profile evidence.
- Updated architecture and agent guidance.

## Implementation plan

1. Capture the production JavaScript baseline and current footer behavior. Record native wheel, trackpad, keyboard, and touch behavior at representative desktop and mobile widths before editing.
2. Audit the installed Motion package and the isolated footer import before broadening its application ownership.
3. Add the strict `LazyMotion`/`MotionConfig` boundary. Keep the feature-loader module narrow and dynamically import `domAnimation`.
4. Protect the current footer content, native scroll ownership, and reduced-motion result with regression tests. Add focused policy tests for any approved easing, distance, or opacity constants rather than asserting animation-frame timing.
5. Refine the existing footer transform into a short eased visual settlement near the end of the page. Prefer one owner-local mapping over new observers, listeners, wrappers, or scroll state. Keep movement small on mobile and ensure content remains readable throughout.
6. Apply the color trial through the existing semantic tokens: warm orange for the active route label and signature, vivid violet for the active underline, muted text for inactive labels, and the established focus token for visible keyboard focus. Keep the external signature SVG self-contained and protect its approved fill in a focused asset test.
7. Verify that wheel, trackpad, Page Up/Down, Home/End, arrow-key, and touch scrolling remain 1:1 native interactions. Review normal and reduced motion at representative mobile and desktop widths, including rapid reversals near the page end.
8. Measure the new route chunk and profile the landing effect in the production build. Remove unnecessary Motion imports that defeat lazy loading.

## Acceptance criteria

- `motion` is the only general-purpose runtime animation library.
- All Motion components under the provider use the slim `m` entrypoint; strict mode detects accidental full `motion` usage.
- Initial animation features are deferred, and `domMax` is absent.
- Wheel, trackpad, keyboard, and touch input retain 1:1 native scrolling; no event handler cancels input or changes its delta, and no runtime animates the document scroll position.
- Approaching the final section produces a subtle visual sense of deceleration and settlement without making the page feel delayed, sticky, or resistant. The effect reverses cleanly when scrolling away.
- The landing remains restrained and responsive on mobile, introduces no horizontal overflow, and never obscures or delays footer content.
- Reduced-motion users receive the complete final section and footer without scroll-linked transform motion.
- The active route label uses warm orange, its underline uses vivid violet, and the footer signature uses the same warm orange. Inactive labels remain muted and keyboard focus stays clearly visible.
- The proof animation remains usable and never hides content when features load slowly or fail to animate.
- Existing hero timing, gallery opening, keyboard behavior, native scrolling, and cleanup tests continue to pass.
- Bundle growth is measured and recorded rather than assumed.

## Verification

- `npm run check`
- `npm run security:audit`
- `npm run build`
- Compare pre/post JavaScript chunks and confirm the feature bundle is deferred.
- Review normal and reduced motion, slow CPU, rapid scroll reversal, navigation away, and back/forward restoration.
- Manually exercise wheel, trackpad, keyboard, and touch scrolling on desktop and mobile; confirm every input remains immediate while the ending visually settles.
- Review the orange active label and signature and violet underline against `#0e0e0e` for contrast, balance, and focus-state clarity before final approval.

## Risks and recovery

| Risk                                          | Mitigation or recovery                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| A normal `motion` import defeats lazy loading | Use strict `LazyMotion`, lint/review imports, and fail tests on provider errors.        |
| Deferred features flash or hide content       | Render semantic content by default and treat animation as enhancement.                  |
| Landing motion makes native scroll feel heavy | Transform presentation only, keep the distance short, and test rapid input reversals.   |
| Color accents overwhelm the photographs       | Limit orange and violet to the three approved roles and review them with varied images. |
| Motion adds cost without product value        | Keep one proof use, measure it, and revert the dependency if the result is unjustified. |

## Definition of done

- The provider, landing effect, color treatment, tests, reduced-motion behavior, and evidence satisfy the acceptance criteria.
- All local and CI checks pass, and no production advisory is introduced.
- Documentation reflects actual Motion ownership and imports.
- The PR and plan index contain final status and links.

## Implementation record

Not started. Record package/version, feature-loading choice, landing behavior, native-input review, color approval, test-first evidence, bundle delta, profiling, CI, remaining limitations, and PR link.
