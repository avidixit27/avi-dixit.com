# 006 — Introduce an accessible Motion foundation

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| Type           | Feature                                |
| Status         | Tracked in the [plan index](README.md) |
| Depends on     | 005                                    |
| Blocks         | 007 and 008                            |
| Planned branch | `feat/motion-foundation`               |
| PR base        | `feat/dark-visual-system`              |
| PR             | Not opened                             |

## Outcome

Motion for React becomes the single general-purpose runtime animation system, with deferred feature loading, global reduced-motion behavior, shared timing policy, and one real production use that proves the integration without establishing speculative abstractions.

## Prerequisites and current state

- React 18.2+ and Vite are compatible with Motion without special Vite configuration according to the official [installation guide](https://motion.dev/docs/react-installation).
- Plan 005 supplies stable visual tokens; Plan 004 supplies delivery-sized images so decode cost does not distort motion profiling.
- Existing hero and lightbox transitions use CSS and timers. Tailwind remains appropriate for simple hover and focus feedback.
- Verify the maintained `motion` release, its production audit, and bundle effect at implementation time. Follow Motion's current [bundle-size](https://motion.dev/docs/react-reduce-bundle-size) and [accessibility](https://motion.dev/docs/react-accessibility) guidance rather than copying stale API examples.

## Scope

- Install `motion` and record the exact locked version.
- Add one application-level Motion configuration that respects the operating-system preference with `reducedMotion="user"`.
- Use strict `LazyMotion` with dynamically loaded `domAnimation` features and the slim `m` components. Do not load `domMax` until an implemented layout or drag interaction requires it.
- Define a small shared duration/easing policy using existing token ownership.
- Convert one existing production transition, expected to be the hero crossfade, to prove enter/exit behavior, image readiness, cleanup, and reduced motion.
- Add a reusable reveal only when this ticket gives it a real production caller and a stable prop contract.
- Record Motion’s isolated JavaScript contribution before and after the proof integration.

## Non-goals

- Do not add parallax, sticky storytelling, page transitions, shared-element transitions, drag gestures, GSAP, WebGL, or scroll hijacking.
- Do not convert simple CSS hover/focus transitions to Motion.
- Do not create a catalog of wrappers, variants, or hooks for hypothetical future effects.

## Deliverables

- Motion dependency and lazy feature boundary.
- Global reduced-motion configuration and shared timing policy.
- One tested production animation with a reduced-motion equivalent.
- Bundle-size and browser-profile evidence.
- Updated architecture and agent guidance.

## Implementation plan

1. Capture the production JavaScript baseline and current hero transition behavior, including timer cleanup and reduced-motion expectations.
2. Install the maintained Motion package and run the production security audit.
3. Add the strict `LazyMotion`/`MotionConfig` boundary. Keep the feature-loader module narrow and dynamically import `domAnimation`.
4. Migrate the selected crossfade using `m` and `AnimatePresence` or a simpler declarative animation where that produces clearer ownership. Preserve click targets, image decode handling, and slideshow timing.
5. Implement an opacity-only reduced-motion path with no large transform, automatic parallax, or hidden content.
6. Update component tests to prove entrance/exit completion, interaction during transitions, unmount cleanup, and reduced-motion content availability.
7. Measure the new route chunk and profile the transition in the production build. Remove unnecessary Motion imports that defeat lazy loading.

## Acceptance criteria

- `motion` is the only general-purpose runtime animation library.
- All Motion components under the provider use the slim `m` entrypoint; strict mode detects accidental full `motion` usage.
- Initial animation features are deferred, and `domMax` is absent.
- The proof animation remains operable and never hides content when features load slowly or fail to animate.
- Reduced-motion users receive an opacity-only or immediate equivalent with all content and controls preserved.
- Existing hero timing, gallery opening, keyboard behavior, and cleanup tests continue to pass.
- Bundle growth is measured and recorded rather than assumed.

## Verification

- `npm run check`
- `npm run security:audit`
- `npm run build`
- Compare pre/post JavaScript chunks and confirm the feature bundle is deferred.
- Review normal and reduced motion, slow CPU, rapid interaction, navigation away, and back/forward restoration.

## Risks and recovery

| Risk                                          | Mitigation or recovery                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| A normal `motion` import defeats lazy loading | Use strict `LazyMotion`, lint/review imports, and fail tests on provider errors.        |
| Deferred features flash or hide content       | Render semantic content by default and treat animation as enhancement.                  |
| Exit timing fights existing timers            | Give one owner responsibility for rotation and exit completion; test unmount paths.     |
| Motion adds cost without product value        | Keep one proof use, measure it, and revert the dependency if the result is unjustified. |

## Definition of done

- The dependency, provider, proof animation, tests, reduced-motion behavior, and evidence satisfy the acceptance criteria.
- All local and CI checks pass, and no production advisory is introduced.
- Documentation reflects actual Motion ownership and imports.
- The PR and plan index contain final status and links.

## Implementation record

Not started. Record package/version, feature-loading choice, proof behavior, test-first evidence, bundle delta, profiling, CI, remaining limitations, and PR link.
