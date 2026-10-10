# 022 — Slow-network portfolio performance

| Field          | Value                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| Type           | Performance fix                                                                   |
| Status         | Tracked in the [plan index](README.md)                                            |
| Depends on     | Shared portfolio implementation on main; cover warming and font preload in PR #59 |
| Blocks         | None                                                                              |
| Planned branch | `fix/eager-portfolio-covers` (approved continuation of PR #59)                    |
| PR base        | `main`                                                                            |
| PR             | [#59](https://github.com/avidixit27/avi-dixit.com/pull/59)                        |

## Outcome

Make cold and warm portfolio interactions responsive on Slow 4G without loading every collection or changing the approved animations. Browser caching should avoid revalidating unchanged generated assets on repeat visits.

## Prerequisites and current state

- The primary checkout was clean and rebased onto main's dependency-maintenance merge before implementation.
- The shared lightbox already paints a selected thumbnail before upgrading to decoded fullscreen media. Preserve its opaque handoff and catalog-based geometry.
- Baseline Chrome profiling at 1.6 Mbps download and 150 ms latency found an approximately 1.99-second first-navigation queue on cold load, versus approximately 308 ms to settle with a warm local cache. These observations are not release targets or deployed measurements.
- Fullscreen neighbor requests and eager cover requests compete with the initial media. Four font files total approximately 200 KB; Inter alone was 111,268 bytes.

## Scope and deliverables

- `public/_headers`: immutable caching only for Vite's content-hashed `/assets/*` paths, not HTML or stable root URLs.
- Shared `Lightbox.tsx`: allow the first navigation while the opening image upgrades; retain the source actually visible as the outgoing layer. The approved follow-up experiment keeps one neighbor in each direction throughout viewing (previous/current/next), without changing quality or adding connection detection.
- `PortfolioMenu.tsx`: start background cover warming after page load, one cover at a time, capped at the first four projects. Later projects retain intent loading; orientation changes restart staged warming.
- Subset the OFL-licensed Inter file to Latin, Latin Extended-A/B, general punctuation, euro and trademark. Keep Zina unmodified because its license forbids derivatives.
- Protect behavior with component tests and update enduring architecture guidance.
- Approved visual follow-up: keep loading status accessible without visible text and show a subtle shared charcoal shimmer only in empty portfolio route, hero and grid slots. Preserve existing previews and respect reduced motion.

## Non-goals

No Rust/Wasm, backend selection, new dependencies, image-quality changes, animation redesign, universal eager loading, or speculative JS splitting. Plan 021 remains a separate architecture-only task.

## Implementation plan

1. Establish transfer and interaction baselines; inspect shared owners and existing regression coverage.
2. Add the hashed-asset cache policy and reduce measured font bytes without changing typography.
3. Remove only the initial decode navigation lock; preserve subsequent queued handoffs and preview-paint safeguards.
4. Stage neighboring media and cover requests in existing owners rather than introducing another preload system.
5. Run focused tests, types, lint, production build and portfolio E2E; verify the cache policy through Wrangler and review cold/warm desktop/mobile behavior before committing.

## Acceptance criteria

- First Next/Previous activation selects its target even if the opening fullscreen image has not decoded.
- The opening view preserves its clicked preview. Adjacent decoded-neighbor handoffs preserve the outgoing photo and queue rapid intent; cold selections show their target-sized shimmer immediately and allow further direct navigation.
- The lightbox retains at most two neighboring images, warming them serially after active-source readiness and rotating with selection to maintain previous/current/next. Small galleries deduplicate neighbors.
- Background cover warming starts after page load and progresses serially without loading full catalogs.
- Generated asset responses use `public, max-age=31536000, immutable`; document responses are not made immutable.
- Inter is approximately 40 KB with its license retained; existing text and display fonts remain visually intact.
- Existing cold-image, routing, close, keyboard and reduced-motion regression checks pass. User visual approval remains required before commit.

## Verification

- `npm run test:unit`
- `npm run typecheck`
- `npm run lint`
- `npx prettier --check src/app/PortfolioMenu.tsx src/app/Navigation.cy.tsx src/features/portfolio/Lightbox.tsx src/features/portfolio/Lightbox.cy.tsx architecture.md docs/plans/README.md docs/plans/022-slow-network-portfolio-performance.md`
- `npm run test:component -- --spec src/features/portfolio/Lightbox.cy.tsx,src/app/Navigation.cy.tsx`
- `npm run test:e2e`
- Use Wrangler on a separate preview port and inspect a hashed asset's response headers.
- In Chrome, use Slow 4G with cache disabled, then repeat with cache enabled. Open a cold grid photograph and immediately navigate. Check portrait/landscape handoffs, selector covers and typography on desktop/mobile. Record observations separately from automated results.

## Risks and recovery

| Risk                                         | Mitigation or recovery                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Preview flashes during fast first navigation | Keep existing paint and opaque decoded-layer safeguards; regression-test the outgoing preview |
| Long-lived stale assets                      | Apply immutable caching only to content-hashed paths; a changed build creates new URLs        |
| Unsupported future non-Latin copy            | Browser fallback remains available; regenerate the subset when language requirements expand   |
| Slower later cover warming                   | Hover/focus still requests the chosen cover immediately; do not preload complete catalogs     |

## Definition of done

Implementation, focused checks, production journeys and visual review pass; architecture and this record reflect actual behavior; the user approves a commit; PR #59 receives review and merges before the index marks this completed.

## Implementation record

- Implementation approved by the user for commit on the existing PR #59 branch. Inter reduced from 111,268 to 39,572 bytes (64.4%). Zina, Tangerine and Zen Tokyo Zoo remain unchanged; retaining the small display-font preloads avoids first-interaction fallback fonts.
- Unit tests: 23 files / 67 tests passed. Type checking and lint passed. Production build passed; main JavaScript is approximately 112 KB gzip, so speculative code splitting was omitted.
- Component verification: 18 lightbox tests and 26 navigation tests passed, including immediate first navigation and staged cover warming, with zero failed/pending/skipped tests. Production E2E: all 13 tests passed. The new preload test initially required correcting Cypress's simulated load-event actionability; strict type/lint findings were also fixed before handoff.
- Wrangler on port 8788 confirmed the hashed Inter asset returns `Cache-Control: public, max-age=31536000, immutable`; HTML retains `public, max-age=0, must-revalidate`. Final types, lint, formatting and diff checks passed.
- A fresh native Chrome preview tab showed the intended desktop lightbox geometry and adjacent navigation. The user approved the changes before commit. The debugger subsequently became available and the controlled measurements below were completed after commit `91830c1`.
- Deployed cache behavior remains unverified until deployment. No CI polling or backend implementation is part of this pass.

### Controlled post-change measurements

Measured the production build through local Wrangler on port 8788 in Chrome's Codex-Sandbox profile. Network emulation: 200,000 bytes/second download (1.6 Mbps), 93,750 bytes/second upload, 150 ms latency; no CPU throttling. Desktop viewport: 1512 × 482; mobile viewport: 390 × 844, not a physical phone. Cold runs disabled browser caching; warm runs enabled caching after one priming journey. Three repetitions per viewport/cache condition.

Opened Home photograph 11 from the grid, then clicked Next to photograph 12 approximately 250–294 ms later. Temporary click listeners and a MutationObserver measured selection and stage `aria-busy` changes; requestAnimationFrame recorded the first frame opportunity after lightbox insertion. These frame timestamps are not compositor paint traces. No application code was modified for measurement. Temporary viewport and network overrides were reset afterward.

| Metric (median)                               | Desktop cold | Desktop warm | Mobile cold | Mobile warm |
| --------------------------------------------- | ------------ | ------------ | ----------- | ----------- |
| Open click → first frame opportunity          | 14 ms        | 11 ms        | 11 ms       | 10 ms       |
| Next click → selection update                 | 5 ms         | 6 ms         | 5 ms        | 6 ms        |
| Next click → decoded image transition settled | 2,182 ms     | 282 ms       | 592 ms      | 227 ms      |

Desktop settled-transition ranges: 2,166–2,221 ms cold and 275–293 ms warm. Mobile ranges: 587–611 ms cold and 223–247 ms warm. Cold image transfer remains the limiting factor; immediate selection feedback must not be described as an immediately visible new fullscreen photograph.

Additional observations:

- On a cold desktop load, the four font requests took approximately 844–1,084 ms individually. These are request durations, not time-to-visible-text measurements.
- Three warm desktop reloads completed the document load event in 172–188 ms; all four fonts reported zero transferred bytes and zero resource duration, indicating cache reuse rather than revalidation.
- Three cold and three warm desktop selector runs inserted the menu 8–12 ms after activation. Paris's cover was ready within approximately 2–10 ms of pointer intent after the menu opened; background warming had already had time to run. This does not establish readiness for every cover when immediately hovered, nor measure the intentional reveal animation's completion.
- The earlier baseline used a different acquisition procedure, so no rigorous before/after percentage improvement is claimed. These results are local controlled observations, not deployed field percentiles. A physical slow mobile device and production-network validation remain follow-ups.

### Three-image buffer experiment

The user approved trying a permanent previous/current/next window. This is shared across portfolios and connections for the experiment, not a new network-detection policy. Only the two existing preload counts and their shared effect changed; responsive image candidates, quality, close behavior and transition timings remain unchanged. The effect no longer expands the cache on settling.

- The updated policy test failed against the old counts before implementation. After implementation, all 67 unit tests, types, lint, formatting, 18 lightbox component tests and 13 production E2E tests passed. Browser completion reports contain zero failed/pending/skipped tests.
- Same desktop cold scenario, three runs: median 2,232 ms until photograph 12 settled (range 2,216–2,259 ms), versus the prior 2,182 ms. There is no demonstrated first-cold-download improvement; both implementations start with two neighbors.
- Two warm batches of three runs: first median 437 ms (399–738 ms), repeat median 263 ms (231–322 ms). The repeat showed zero transferred bytes for the target media. Render/input timing varied too, so these measurements do not establish a speedup or regression versus the prior 282 ms median; report both batches rather than selecting the faster result.
- Four rapid cold Next clicks, starting at photograph 11, retained queued intent and settled at photograph 3, with two preload elements and `aria-busy=false`. It settled approximately 2.50 seconds after the final click: rapid uncached navigation can still outrun the buffer, but did not stall permanently.
- A cold mobile smoke test settled the same next photograph in 598 ms, with exactly two neighbors. This is one sample, not a mobile distribution.
- The user approved the cached experience and requested a checkpoint commit. Local Wrangler preview on port 8788 serves the experiment. No push or CI polling for this checkpoint; temporary browser viewport/network overrides were restored.

### Intent warming and staged neighbors experiment

The user approved trying two bounded scheduling changes after checkpoint `015790c`: grid hover/focus warms the selected fullscreen candidate at high priority and the next candidate at low priority; the shared lightbox starts new neighbor requests only after the current source decodes, warming forward before backward. Existing neighbor requests are retained within the rolling window. Failed neighbor decodes advance the queue, and stale selection/unmount work cannot start further requests. No media quality, source candidates, animation timing, dependency, connection detection or route-specific policy changed. The grid's two intent candidates are separate from the lightbox's two-neighbor cache; this is not a promise that the browser holds only three decoded images globally.

- Regression tests failed against the checkpoint before implementation. After implementation: 67 unit tests, 22 focused component tests (PhotoGrid and Lightbox), 13 production E2E tests, type checking and affected-file lint passed. Both fresh browser completion reports contain nonzero completed specs/tests and zero failures, pending or skipped tests.
- Repeated the same local Wrangler desktop Slow 4G procedure and photograph 11 → 12 journey with caching disabled: three-run median settled transition **1,390 ms**, range 1,373–1,420 ms, versus the checkpoint's 2,232 ms median. Next selection remained immediate (median 4 ms). This is an observed local improvement of approximately 842 ms, not a deployed field percentile or an interleaved A/B test.
- After a separate cache-enabled priming run, three warm desktop runs settled in a median **234 ms**, range 230–242 ms. One cold mobile smoke run settled in **628 ms**; it is not a mobile distribution and does not demonstrate a mobile improvement over the checkpoint's 598 ms sample.
- Browser network/cache/viewport overrides were restored. Screenshot evidence: `/private/tmp/portfolio-staged-preloads.png`. Full-quality cold downloads remain network-bound; backward navigation can wait longer because warming deliberately favors forward intent.
- Left uncommitted for user visual review. No push or CI polling for this experiment.

### Loading fallback alignment

The user's recording showed the centered HTML bootstrap yielding to a left-aligned React route fallback. Centered the shared route fallback in a small-viewport-height grid, without changing bootstrap, route transitions, text or colors. Desktop/mobile Chrome component checks (2 tests, zero failed/pending/skipped), type checking, affected-file lint, formatting and production build passed. Skeleton shimmer was proposed here and approved in the subsequent follow-up below. Left uncommitted alongside the approved scheduling experiment.

### Approved skeleton presentation

Added one opt-in shared responsive-image loading state and a CSS-only 1.8-second transform shimmer over the existing charcoal surface token. Hero and grid owners opt in; the hero only shimmers its active empty slot. Portfolio route fallbacks use the same treatment beneath centered loading text. Other routes, existing lightbox previews, hidden preloads, source candidates, fetch priorities and image/route transitions stay unchanged. Load and error remove shimmer; reduced motion disables animation. Catalog width/height and existing viewport geometry reserve space without layout movement.

- A new regression test failed against the previous component before implementation. After implementation: 67 unit tests, 32 focused Chrome component tests, 13 production E2E tests, type checking and lint passed. Fresh browser reports show nonzero completed specs/tests and zero failed/pending/skipped tests. Formatting and diff checks passed.
- Inspected cold Slow 4G mobile and desktop Paris through local Wrangler on port 8788. Centered route status and active hero placeholders were visible; inactive hero sources did not shimmer. After loading, all hero pictures had cleared their shimmer class. Browser network/cache/viewport overrides were restored.
- Screenshot evidence: `/private/tmp/portfolio-skeleton-loading.png` and `/private/tmp/portfolio-skeleton-desktop.png`. No physical-device performance trace or deployed measurement for the shimmer; it does not reduce download time.
- No dependency, commit, push or CI polling. Awaiting user visual review.

### Cold carousel navigation feedback

The user approved extending shimmer to unloaded Next selections. The shared lightbox records successful neighbor decode in its existing bounded cache. Cold targets immediately replace the previous photograph with a catalog-sized shimmer, and further cold navigation advances directly instead of waiting behind the target download. Decoded-neighbor handoffs keep their outgoing-photo geometry and queued animation behavior. The opening clicked preview remains unchanged. A failed cold request stops shimmer, announces failure and leaves navigation available; no retry framework or new dependency was added.

- New cold feedback tests failed before implementation. Final focused verification: 21 lightbox component tests, 67 unit tests, types, affected-file lint and production build/E2E (13 tests). Browser reports contain zero failed/pending/skipped tests. Warm handoff fixtures now explicitly control preload decode readiness rather than assuming nonexistent fixture images are warm.
- Cold Slow 4G desktop visual check: photograph 11 → 12 updated the number immediately, showed a target-sized shimmer with no outgoing image, and settled with no remaining loader. Three subsequent mobile Next actions advanced 11 → 12 → 1 → 2 without becoming stuck. Browser overrides restored.
- Screenshot: `/private/tmp/cold-carousel-shimmer.png`. No new speed claim: this changes feedback during network waits, not image quality or preload limits. Left uncommitted for user visual approval; no push or CI polling.

### Approved checkpoint publication

The user approved committing and pushing the intent-warming, centered-loading, shared-shimmer and cold-navigation follow-ups to the existing PR #59 branch. The recorded local verification above remains the evidence for this checkpoint; no additional full-suite rerun or CI polling is required to publish it.

### Review follow-up: failed warm handoff

The shared lightbox now allows navigation away from a failed displayed image even when its neighbor preload previously decoded. Warm handoff failures use the existing non-shimmer failure panel instead of leaving the old photograph on screen. Successful handoff and close timings remain unchanged. Added a component regression for a decoded neighbor whose displayed image fails; the focused suite completed 22 tests with zero failed, pending or skipped tests. All 67 unit tests, type checking and affected-file lint passed. Left uncommitted for visual approval.

### Reversible cover-preview shimmer experiment

The user requested trying shimmer behind unloaded selector cover previews. `PortfolioMenu` opts only its displayed cover into the existing shared responsive-image skeleton; hidden preloads, fetching policy and selector animation timings are unchanged. The normal dark menu remains plain until a project receives hover/focus/selection. Reverting this experiment means removing that opt-in and its picture positioning classes plus the isolated cold-cover component test; preserve the separate warm-handoff fix above.

All 27 navigation component tests completed with zero failed, pending or skipped tests. Types, affected-file lint and production build passed. Native Chrome inspection confirmed shimmer on an unloaded Paris preview and removal after load. A held-image visual check captured `/private/tmp/portfolio-cover-shimmer.png`; temporary network/cache/interception overrides were cleared and the preview reloaded. This is visual feedback, not a download-speed improvement. Left uncommitted for user review.

The user visually approved the cover shimmer and requested a local checkpoint commit including the pending warm-handoff fix, before trying a separate short cover-reveal transition. No push was requested for this checkpoint.

### Short cover-reveal experiment

Saved the approved checkpoint as `c06062f`. The next experiment adds a cover-only **150 ms ease-out opacity transition** from the existing skeleton state, with the charcoal surface retained behind the image and no transition for reduced motion. Loading, source candidates, image quality, readiness gates, interaction timing and dependencies are unchanged; there is no additional wait before clicks can proceed. **Simplify:** use CSS and the existing image load state rather than another animation owner or timer.

[Material's image-loading guidance](https://m1.material.io/patterns/loading-images.html) describes progressive fade-ins, and [PIE's timing guidance](https://pie.design/foundations/motion/timing/) uses 100–150 ms for short feedback. The selected 150 ms is a scoped design choice, not a universal image-loading standard.

The two request-dependent cover checks now run before navigation interactions can warm the same decoded images in Chrome. Their suite temporarily disables HTTP caching and restores it afterward. All existing assertions remain; the cold-preview check also verifies opacity, duration, easing and reduced motion. Two consecutive focused runs completed 27 tests with zero failures, pending or skipped tests; the final completion report is `cypress/results/2026-10-10T14-22-30-445Z-13818.json`. Type checking, affected-file lint/format and production build passed. Native Chrome verified the unloaded opacity of zero and loaded opacity of one, with a 150 ms ease-out transition. Screenshot: `/private/tmp/portfolio-cover-soft-reveal.png`. Temporary interception/cache overrides were restored.

This experiment is uncommitted for visual approval. CI, the complete local matrix and physical-device frame-time profiling were not run. It changes visual settling, not download time; opacity avoids layout animation but still has rendering cost.

### Hidden loading labels

The user approved hiding visible loading labels in both bootstrap and route fallback while retaining accessible status text. The bootstrap uses scoped inline visually-hidden styling because Tailwind is unavailable before JavaScript loads; the React fallback reuses Tailwind's `sr-only`. Portfolio shimmer, plain non-image fallbacks, fetch policy, geometry and animation timing are unchanged. The pending cover-reveal experiment is preserved.

Updated desktop/mobile component checks protect viewport-sized shimmer and accessible clipped text; reduced-motion coverage remains. The checks failed before implementation and all three passed after implementation (`cypress/results/2026-10-10T14-40-12-916Z-21511.json`, no failures/pending/skips). Type checking, affected-file lint/format and production build passed. Native Chrome verified the hidden bootstrap status with startup scripts temporarily held, then verified the portfolio shimmer with its route module held; restoring normal loading rendered Paris successfully. Screenshot evidence: `/private/tmp/portfolio-quiet-bootstrap.png` and `/private/tmp/portfolio-quiet-shimmer.png`. All temporary interception/cache overrides were restored. No commit or push; full-suite/CI and a physical screen-reader audit were not run.

### Preserve the cover during selector-exit reset

Saved the user-approved reveal and hidden-label changes as local checkpoint `99aec47` before beginning this fix. No push was requested. A component regression reproduced the shared cause: the route reset used a React key, recreating the slideshow and its images after the selector exited. The hero now consumes that same reset signal as a prop, resets selection before committing the changed render, and restarts its interval while preserving existing image nodes and loaded-photo readiness. **Simplify:** keep timer ownership in the existing shared slideshow; no new preload, dependency, route-specific policy or animation timing.

The regression uses `PortfolioExperience` to protect the real prop wiring, cover-node identity, retained loading state, full first-slide interval and repeated return to the cover. It failed against the checkpoint and passed after the fix. Final verification: 32 component tests across the shared hero and Navigation (`cypress/results/2026-10-10T14-54-47-302Z-29282.json`, zero failures/pending/skips); 67 unit tests; types, affected-file lint/format and production build passed. The first implementation's effect-based reset was rejected by the existing Hooks lint rule; the final implementation uses a guarded state adjustment tied to the reset signal, with no suppression.

Native Chrome at Slow 4G (1.6 Mbps, 150 ms latency), cache enabled and 4× CPU throttling confirmed the destination cover had the same DOM backend identity before and after selector exit for Nature reselection and a switch to Paris. Both ended with the loaded cover and no skeleton. Screenshot: `/private/tmp/portfolio-stable-cover-handoff.png`. Network and CPU overrides were restored. These checks prove node retention, not a compositor frame trace or all-device absence of flashes. The fix remains uncommitted for user visual approval; no CI, full production E2E rerun or physical-device profiling.

The user subsequently confirmed the visual fix and approved committing it to the existing PR #59 branch. Publishing includes the approved local checkpoints above; the user will monitor CI. The recorded focused verification remains current because executable files have not changed since those checks.

### Review follow-up: failed background cover preload

Verified the review finding in native Chrome against the production build: with caching disabled, fail Paris's low-priority background cover request and hold its high-priority retry. The old selector dismissed while the retry still had zero loaded pixels; the hero subsequently advanced to another photograph while that request remained blocked.

**Keep:** the shared menu now distinguishes settled cover requests from handoff readiness. Background failures advance the existing bounded warming queue without granting readiness. Successful loads still enable the handoff, and unavailable covers or failed displayed retries preserve the existing terminal-failure escape path. No timing, source selection, quality, dependency or project-specific logic changed.

The component regression controls native load events because Chrome's decoded-image cache can bypass HTTP interception; synthetic error/load events exercise failure, queue progression, retained selector/shimmer and successful retry. It runs after the existing cold-network tests and removes its temporary listener after the test. Restoring the faulty background error callback made this final regression fail at the premature-dismissal assertion; restoring the fix made it pass.

Native Chrome verified the corrected behavior with a real failed background request: the selector remained present and did not start navigating while the retry was held, then dismissed after the retry completed with the loaded Paris cover active. Temporary interception and cache overrides were cleared. Screenshot: `/private/tmp/portfolio-cover-retry-fixed.png`.

Verification: all 67 unit tests, types, affected-file ESLint, formatting and production build passed. Final post-restoration navigation verification passed all 28 tests with zero failures/pending/skips (`cypress/results/2026-10-10T15-32-05-150Z-66019.json`). Left uncommitted and unpushed for visual approval; no new CI run, complete local matrix or physical-device profiling.

### Cold-cover reset follow-up

The user's recording exposed a remaining gap in the approved reset fix: keeping the slideshow component does not preserve a cover that has left the rendered slide window, and the reset still uses the normal opacity crossfade. The shared resettable hero now retains the already-requested cover and resets it with no opacity transition. Ordinary rotations retain the 700 ms crossfade; Home's non-resettable rolling window is unchanged. **Keep:** at most one extra mounted cover in a resettable hero, without another preload or any change to photographic quality, selector timing or dependencies.

Extended the existing reset regression to four photographs and a completed outgoing-slide cleanup. It protects cover identity, retained loading state, immediate reset opacity policy and the full first-slide interval. The initial regression failed against the old 700 ms reset transition. Focused verification passed 33 component tests across HeroSlideshow and Navigation (`cypress/results/2026-10-10T15-43-55-069Z-71461.json`, no failures/pending/skips), all 67 unit tests, types, affected-file lint and production build.

Native Chrome used disabled caching, Slow 4G and 4× CPU throttling. Holding Nature's cover allowed the underlying hero to rotate past it; after releasing the request, frame sampling confirmed the same cover element survived selector exit and reset with loaded pixels, opacity 1 and a zero-duration reset, followed by the normal crossfade. These DOM measurements do not prove every compositor frame on every device. Interception/network/CPU/cache overrides were restored. The final refinement limits retained covers to resettable heroes; its five component tests passed again (`cypress/results/2026-10-10T15-46-21-379Z-74019.json`) and the production build and formatting checks passed. Chrome verified the final build's loaded cover with a zero-duration reset; screenshot: `/private/tmp/portfolio-cover-reset-fixed.png`. Left uncommitted for user visual approval; no CI or full E2E rerun, physical-device or heap profiling.

The user visually approved both pending fixes and authorized committing and pushing them to the existing PR #59. No additional executable changes were made after approval; the focused verification above remains current. CI is the remaining complete gate before the next PR review.

### Review follow-up: stale lightbox readiness on return

The A → cold B → A component regression reproduced stale readiness: the newly mounted A image inherited A's previous loaded/settled IDs, suppressing loading feedback before its fresh decode. **Simplify:** clear both readiness IDs in the shared `openPhoto` handler after capturing the outgoing source and before selecting the target. No preload policy, photo quality, source candidates, animation timings or project-specific behavior changed.

The final regression failed against the old code with zero loading placeholders on return, then passed after the two-line reset. All 23 lightbox component tests passed with zero failures/pending/skips (`cypress/results/2026-10-10T16-09-14-933Z-82487.json`), including existing warm handoffs, queued navigation, portrait geometry and close behavior. All 67 unit tests, type checking, affected-file ESLint, formatting and production build passed. The initial red run hit the held-request timeout while retrying the missing-placeholder assertion; the final assertion checks the committed selection immediately so the red result identifies the application defect rather than that timeout.

Left uncommitted and unpushed for user visual approval. No new CI run, full production E2E rerun, manual native-browser visual review or physical-device profiling was performed for this fix.

The user subsequently approved publishing this fix to PR #59. Executable files remain unchanged since the focused verification above; the new CI run is the complete PR gate.

### Review follow-up: queued intent after image failure

The regression reproduced an unwanted third selection: queue Next during a warm handoff, fail its displayed image, manually advance, then decode the new image. Its settling timer previously replayed the abandoned handoff's queued offset. **Simplify:** clear pending intent once in `openPhoto` when selecting a new photo. Normal warm handoffs still capture and apply their queued offset in the existing settling callback before calling this handler. Image policy, source selection, quality and animation timings are unchanged.

The test failed before the fix with three selections instead of two. Initial harness iterations exposed held-request timeouts; the final test controls only timeout functions, keeps real animation frames, and checks the selection callback directly after advancing the transition timer. A typed clock argument was corrected before final verification. All 24 lightbox tests passed with zero failures/pending/skips (`cypress/results/2026-10-10T20-14-33-360Z-1044.json`), including the existing warm queued-handoff regression. All 67 unit tests, type checking, affected-file ESLint, formatting and production build passed.

Left uncommitted and unpushed for approval. No new CI run, full E2E rerun, manual native-browser visual review or physical-device profiling was performed for this fix.

### Recurring cover flash: hidden slideshow rotation

Compared the approved fixes `5c9c868` (preserve the slideshow component) and `157addf` (retain the cover and reset without a crossfade). Both safeguards remain present at `9e83d52`; the later lightbox readiness changes did not revert them. Chrome with cache disabled, 1.6 Mbps download, 150 ms latency and 4× CPU throttling reproduced a remaining ordering gap: hold Nature's cover while a neighbor loads, then release it after multiple slideshow intervals. During selector dismissal, the preview showed the cover but the hero showed a later photograph at opacity 1; only after dismissal did the route reset restore the cover. Preserving the cover element alone cannot prevent this intermediate mismatch.

**Simplify:** the existing shared hero interval now skips rotation while `html.modal-open` is present, reusing the selector/lightbox lifecycle signal without another listener, timer, prop chain or per-project policy. The selector's existing final reset still starts a complete first-slide interval. Image sources, quality, warming, animation durations and the earlier node-preservation safeguards are unchanged. Home also avoids rotating behind a modal.

The new component regression controls timer functions but retains real animation frames, loads the neighbor before the cover, and verifies the selected cover across multiple modal-time ticks before checking rotation resumes after dismissal. A first draft using fully fake time falsely passed because React updates remained batched; after synchronizing with a real frame it failed against the old code (`cypress/results/2026-10-10T20-28-34-458Z-9174.json`) and passed with the shared guard. All 58 affected HeroSlideshow, Navigation and Lightbox tests passed with no failures/pending/skips (`cypress/results/2026-10-10T20-29-00-391Z-11527.json`); all 67 unit tests, types and production build passed.

Native Chrome retested the final production build with the same held cold Nature cover: every sampled dismissal frame retained the cover at opacity 1 beneath the preview, with zero different-photo frames during the fade. Captured and inspected both warm and cold Chrome screencast frames; the cold recording contains 150 frames over approximately 3.2 seconds (`/private/tmp/portfolio-cover-handoff-cold-fixed.mp4`, re-encoded at an approximate fixed frame rate). Its final screenshot is `/private/tmp/portfolio-cover-handoff-cold-fixed.png`. Paris at 390 × 844 also retained its loaded portrait cover throughout dismissal; screenshot: `/private/tmp/portfolio-cover-mobile-fixed.png`. Temporary interception, cache, network, CPU and viewport overrides were cleared and a reload removed frame instrumentation. Affected-file lint, formatting and diff checks passed. No new CI run, full E2E rerun, physical-device or other-browser profiling was performed.

Repeated review cycles have exposed different missed transition boundaries, not evidence that every previous fix was removed. The cover tests covered final reset identity/opacity but not modal-time rotation; the failed-image lightbox unlock lacked abandoned queued-intent coverage. Review fixes must reproduce and protect their own interaction before being layered onto an approved baseline. `architecture.md` records the shared invariant and `AGENTS.md` requires known-good history comparison, transition-level regression coverage, and cold/warm visual verification. No separate bug directory duplicates this plan's incident evidence. Changes remain uncommitted for user visual approval.

### Remaining black cover interval: lazy route wrapper readiness

The user's 4:35 PM recording still shows the selected Kerala cover darkening to black after the labels collapse, then returning. The preceding held-image test protected against a different-photo timer mismatch but did not delay the independent lazy route wrapper; calling that sufficient verification of the reported flash was premature.

Native Chrome reproduced the missing boundary by holding the production `PortfolioProjectRoute` script while allowing the selected project module and cover to load. Before the fix, the selector disappeared while the destination still showed its loading fallback and had no hero (`/private/tmp/cover-wrapper-gap.png`). `preloadPortfolioProject` previously awaited only the project module, although `RouteTransitionBoundary` separately lazy-loads the wrapper that renders it.

**Simplify:** await both existing modules concurrently in the shared intent preloader. No new abstraction, callback, delay, eager full-catalog loading, animation timing, image quality or project-specific policy. Preserve the independently verified modal-time rotation guard and earlier cover-node/reset safeguards.

The new unit regression holds the wrapper unresolved and verifies readiness remains pending. It failed against the old implementation and passes with the fix. All 68 unit tests, type checking, affected-file ESLint/formatting and the production build passed. The affected Navigation and RouteTransitionBoundary component suites completed 34 tests across two specs with zero failures/pending/skips (`cypress/results/2026-10-10T20-39-55-370Z-15114.json`).

Chrome production-preview verification used cache disabled, 1.6 Mbps download, 150 ms latency and 4× CPU throttling. Holding the wrapper now retains the loaded cover and menu labels (`/private/tmp/wrapper-wait-fixed.png`). Releasing it produced 57 captured frames over approximately 1.29 seconds; the inspected frames show continuous cover imagery, and frame instrumentation recorded zero visible route-fallback frames during dismissal. Recording: `/private/tmp/kerala-wrapper-handoff-fixed.mp4` (approximate fixed-frame-rate encoding); screenshot: `/private/tmp/kerala-wrapper-handoff-fixed.png`. Temporary browser interception/network/cache/CPU overrides were restored afterward. No new CI run, complete E2E rerun or physical-device/other-browser verification. Changes remain uncommitted and unpushed for user visual approval.

### Approved regression checkpoint

The user approved pushing the queued-intent, hidden slideshow rotation and lazy-wrapper readiness fixes, their regression tests, and the accompanying architecture/execution safeguards to the existing PR #59 branch. The preceding local and visual verification remains the evidence for this checkpoint; publication does not require duplicating the complete CI matrix locally. Plan 022 remains in progress pending PR review and merge.
