# 016 — Optimize brand assets and photo delivery

| Field          | Value                                                                       |
| -------------- | --------------------------------------------------------------------------- |
| Type           | Performance fix                                                             |
| Status         | In review                                                                   |
| Depends on     | [015 — Browser-test reliability](015-browser-test-reliability.md)           |
| Blocks         | [017 — Feature availability controls](017-feature-availability-controls.md) |
| Planned branch | `perf/brand-and-photo-payloads`                                             |
| PR base        | `main`                                                                      |
| PR             | [#45](https://github.com/avidixit27/avi-dixit.com/pull/45)                  |

> Approved. The user selected AVIF → WebP → JPEG for portfolio photos and approved the complete plan. Plan 015 merged through PR #43.

## Outcome

The navigation retains its approved portrait-and-wordmark design while loading small assets appropriate to their rendered size. The wordmark contains vector lettering only, the portrait is a separately compressed WebP with the same crop, and the favicon has a truthful format and practical dimensions. Portfolio photos prefer AVIF, retain WebP for browsers without AVIF support, and retain JPEG as the final compatibility fallback. Build-time encoding reduces transfer at visually approved quality while source selection and preloading remain consistent.

## Prerequisites and current state

- Start from `main` after Plan 015 merges; use its verified test runner and diagnostic workflow. Plan 014 is already merged through PR #41, and its navigation and motion behavior must be preserved.
- `src/assets/brand/avi-dixit-wordmark.svg` is approximately 860 KB and is emitted at approximately the same size in the production build. Its gzip size is approximately 483 KB.
- The SVG contains vector paths for the Zina wordmark and an embedded base64 JPEG of approximately 649 KB. The raster is displayed at roughly 48–56 CSS pixels high, so the source resolution and encoding are disproportionate to its use.
- The prior production JavaScript entry was approximately 100 KB gzip. The compressed combined wordmark alone is therefore nearly five times that entry payload.
- `public/favicon.ico` is actually a 4066 × 4000 RGBA PNG stored with an `.ico` extension and weighs approximately 2.9 MB.
- `index.html` preloads the combined wordmark at high priority on every route. Reassess that hint after splitting the asset so it does not compete unnecessarily with the Home hero.
- The approved portrait source is the exact image currently embedded in the wordmark. Preserve its crop and visual appearance, resize it for navigation use, encode it as WebP, and create the favicon from the same portrait.
- Same-sized untracked files whose names contain `-optimized` are experiments rather than plan inputs. Preserve unrelated user files and do not adopt or delete them without an explicit decision.
- `vite.config.ts` currently generates portfolio candidates at widths 480, 960, 1440, and 2160 with quality 82 for JPEG and WebP. The JPEG `src` fallback is also 1440 pixels wide. Verify actual emitted deduplication; the target is four widths in each of three formats, with the fallback reusing the matching JPEG candidate.
- `photoCatalog.ts` owns generated sources, stable IDs, alternative text, and intrinsic dimensions. `ResponsiveImage.tsx` already renders ordered typed `<source>` elements followed by a JPEG `<img>` fallback; its contract can carry AVIF without a new image component.
- The existing build image tooling uses Sharp and supports AVIF output. Confirm the installed encoder and directive support before setting format-specific options; matching numeric quality settings across codecs does not establish equal visual quality.
- `Lightbox.tsx` explicitly chooses WebP for standalone `Image` preloads. Its adjacent-navigation preview also uses the JPEG `photo.src`. Simply adding AVIF sources to presentation can therefore leave redundant WebP/JPEG requests. Inspect initial preview reuse, adjacent navigation, preload retention, and decode paths together.
- Format support is a browser capability, not a proxy for machine age or decode speed. Native source selection does not benchmark codec quality or performance and does not guarantee fallback after a selected URL fails to download.

## Delivery policy and tradeoffs

- **Keep:** the four existing responsive widths, intrinsic dimensions, native image selection, JPEG fallback, stable photo IDs, and bounded lightbox preload window. Do not increase resolution simply because AVIF is enabled.
- **Keep:** WebP portfolio candidates, as selected by the user, to avoid sending larger JPEGs to browsers that support WebP but not AVIF. Generate AVIF → WebP `<source>` elements in that order, with JPEG `srcset` and `src` on `<img>`.
- **Simplify:** one ordered source contract for displayed images and preloading. Remove the preloader's unconditional WebP assumption rather than introduce parallel codec policies. Keep format/build details out of route and general UI components.
- **Measure first:** AVIF quality, encoder effort, transfer savings, browser decode cost, cold/warm build duration, peak memory, output storage, and deployment upload cost. No fixed build-time budget was requested; present measured costs with visual approval before finalizing settings.
- **Keep:** the original plan's small 192 × 192 WebP navigation portrait and 64 × 64 PNG favicon. The three-format policy applies to portfolio photographs, not every small brand asset or third-party image.

At four widths, the policy targets 12 variants per photo instead of eight: 144 versus 96 for the current 12-photo collection, or 6000 versus 4000 for a hypothetical 500-photo collection. These are planned candidate counts, not files fetched per visit or measured build costs. Reuse the 1440-pixel JPEG for `src` rather than generate a thirteenth candidate.

A browser ordinarily selects one supported source/candidate for a stable image presentation; it does not download all fallback formats in sequence. Actual journeys may fetch additional images because of preview upgrades, resizing, slideshow preparation, and neighboring-photo preloading. There is no universal one- or two-request ceiling. Account separately for deliberate responsive upgrades and avoidable codec mismatches. AVIF encoding happens at build time, but compressed assets still consume storage and browser decode work at runtime.

## Scope

- Extract the current embedded portrait without altering its crop, color, or subject placement.
- Produce a committed navigation WebP sized for the displayed portrait and common high-density screens. Prefer one appropriately sized source over a responsive asset family unless browser measurement demonstrates a visible need for multiple variants.
- Convert the existing wordmark asset to a tight, text-only SVG containing the approved Zina vector paths and neutral navigation color.
- Compose the portrait and vector lettering inside the existing single Home link with explicit intrinsic dimensions and the current responsive alignment.
- Replace the mislabeled oversized favicon with a correctly encoded, small favicon derived from the same portrait and update `index.html` metadata.
- Reevaluate image preload and fetch-priority hints against the Home hero request order.
- Add meaningful source and production asset budgets that prevent embedded raster data or multi-megabyte icons from returning.
- Record source, gzip or Brotli, emitted build, and request-priority measurements before and after the change.
- Generate AVIF variants for the existing portfolio photo widths while retaining current WebP/JPEG outputs. Tune AVIF separately using representative photographs and preserve approved grain, fine detail, gradients, shadows, color, crop, and orientation.
- Align lightbox preloading and display selection with the ordered source contract. Preserve immediate reuse of the clicked image's `currentSrc`, the outgoing decoded frame, the three-forward/two-backward preload limit, cleanup, and queued navigation behavior.
- Verify the complete format order, JPEG fallback, runtime source selection, decode transitions, emitted candidate count, and network behavior in production.

Anticipated ownership includes `src/assets/brand/`, `src/app/Navigation.tsx`, `src/app/wordmark.test.ts`, `public/`, `index.html`, `vite.config.ts`, the portfolio catalog and tests, `Lightbox.tsx` and its tests, the existing shared image component/tests as needed, and production browser coverage. Keep any extracted preload responsibility in the portfolio feature. Do not add an image-processing runtime dependency.

## Non-goals

- Do not redesign the portrait, change the wordmark typography, recolor the navigation, or alter its approved alignment and sizing.
- Do not modify the signature logo, editing originals, photo composition, responsive width policy, or the approved slideshow/lightbox interaction design.
- Do not retain a high-resolution portrait in an imported frontend asset merely for possible future reuse.
- Do not introduce a general image component, asset manifest, CDN, service worker, or runtime image transformation system.
- Do not add Apple touch icons, social-preview images, a web manifest, or broader metadata work unless separately approved.
- Do not optimize for the smallest possible byte count at the expense of a visibly degraded portrait.
- Do not change the browser-support policy, add client-side codec conversion, user-agent sniffing, a runtime image service, a new hosting system, or a speculative renderer abstraction.
- Do not claim that AVIF automatically improves resolution/quality, guarantees a fixed size saving for every photograph, or removes browser decode costs.

## Deliverables

- Text-only Zina wordmark SVG with no embedded raster or font dependency.
- Efficient WebP navigation portrait preserving the current crop.
- Correctly encoded and sized favicon using the same portrait.
- Navigation composition preserving one accessible Home link and stable intrinsic layout.
- Focused asset-integrity and byte-budget regression tests.
- Before-and-after build and browser-transfer evidence.
- AVIF/WebP/JPEG portfolio delivery through the existing image contract, with matching preload selection and preserved preview/decode behavior.
- Per-format photographic quality review and source-selection tests, plus a before/after report covering photo bytes, unique output count, build cost, and browser decode/LCP behavior.

## Implementation plan

1. Capture baseline source sizes, compressed sizes, emitted asset sizes, Home request order, and the navigation's rendered dimensions at representative mobile and desktop device-pixel ratios. Also record JPEG/WebP bytes per photo/width, actual output count, clean/warm build duration and peak memory, and repeated cold-load/adjacent-lightbox traces. Record hardware, browser, viewport, network conditions, and build versions for comparisons.
2. Extend the existing wordmark test so it fails while the SVG contains an `<image>`, a `data:image` value, unnecessary editor metadata, or exceeds the approved vector byte budget. Preserve the existing assertions for path-based Zina lettering and its neutral color.
3. Extract the embedded JPEG exactly once, preserve the visible square crop, resize it to 192 × 192 pixels, and encode a visually reviewed WebP. Commit only the delivery asset and record its provenance; do not add conversion tooling to the application dependency graph.
4. Remove the raster and obsolete Adobe wrapper content from the wordmark SVG, tighten its view box to the lettering, preserve vector paths, and keep `currentColor` or the established neutral fill according to the simplest composition that retains current hover and active behavior.
5. Compose the portrait and text-only SVG within the existing Home link. Give each image explicit width and height, apply the circular crop to the portrait with CSS, keep decorative child images out of the accessibility tree, and retain one descriptive accessible name on the link.
6. Add or update navigation component coverage for visual ordering, intrinsic geometry, responsive vertical alignment, link semantics, and the active/hover color behavior already protected by the suite.
7. Generate a 64 × 64 PNG favicon from the same crop, name it with the `.png` extension, update the icon link with its correct MIME type and dimensions, and remove the obsolete oversized mislabeled file from tracked production assets.
8. Add focused integrity checks for the WebP and PNG signatures and conservative byte ceilings. Use budgets as regression safeguards rather than assertions for an exact compressor output.
9. Prototype AVIF encoding with the installed build pipeline at the existing widths. Compare several quality/effort settings on dark, detailed/grainy, gradient, portrait, and landscape examples against the current outputs at equal dimensions. Review at actual display sizes and 100% crops; record selected settings and encode time. Do not blindly reuse JPEG/WebP quality 82. If acceptable quality and worthwhile savings cannot both be achieved, present that evidence before changing the selected format policy.
10. Add generated AVIF source sets to the catalog before WebP and retain JPEG fallback candidates. Reuse the 1440-pixel JPEG as `src`; verify emitted assets deduplicate as intended. Keep the existing `Photo`/image props provider-neutral and adjust meaningful format-contract coverage without changing routes.
11. Replace the unconditional WebP preload selection with the same ordered source selection used by the displayed image. Prefer browser-native typed source selection; verify it in the actual preload context before relying on it. Any required helper must be feature-owned and handle unsupported formats without browser access during module initialization. Do not start one codec request then switch to another as the preload mechanism.
12. Review adjacent navigation's JPEG preview path alongside the preload change. Reuse an already decoded selected candidate where available and retain the outgoing frame while the next image loads. Verify cache hits, slow/failed decoding, rapid queued navigation, cleanup, and the unchanged bounded preload window. Record any deliberate preview request separately from avoidable format mismatches.
13. Add focused catalog/source-order and lightbox regression coverage using Plan 015's readiness and execution-evidence conventions. In production, inspect `currentSrc`, response MIME types, dimensions, and the request waterfall on Home, initial viewer open, next/previous navigation, and resize. Test JPEG-only and WebP-plus-JPEG source configurations as fallback wiring checks; label these simulations accurately. A blocked AVIF request is not proof of unsupported-format fallback. Check actual supported-browser behavior separately and record any unavailable browser coverage.
14. Compare emitted assets, raw/transfer photo bytes, output storage, clean/warm build times, peak memory, request priority, LCP, and image-readiness timing on representative desktop and mobile devices. Use repeated comparable runs to distinguish variance from regressions. Retain only preload hints supported by measurements; do not preload every codec. Report total corpus AVIF savings relative to existing WebP at approved quality and any per-photo regressions. Inspect projected scale separately from measurements on the 12-photo corpus.
15. Run focused asset/catalog unit tests, affected component tests, lint, formatting, type checks, and the production build. Review navigation and favicon plus actual portfolio photographs, normal/reduced motion, slow loads, and high-density viewports. Present photographic quality and build/runtime tradeoffs for user approval before final settings are accepted.
16. After visual approval, run the production E2E journey and security audit, then push for the full CI gate. Use `npm run check` only when required by the repository's verification policy or a remaining cross-cutting concern; do not duplicate successful complete runs solely because the command exists. Record actual commands, measurements, limitations, and final approval.

## Acceptance criteria

- The wordmark SVG contains vector lettering only: no embedded image, base64 data, live `<text>`, font reference, or editor-generated raster wrapper remains.
- The navigation portrait preserves the currently approved crop and remains sharp at its largest rendered size on a 3× device-pixel-ratio display.
- The portrait and lettering have explicit intrinsic dimensions, do not shift while loading, and remain aligned at existing mobile and desktop breakpoints.
- The portrait and lettering remain one accessible Home link with no duplicate image announcement.
- The replacement favicon's extension and declared MIME type match its actual PNG encoding, and its dimensions are appropriate for favicon display.
- The text-only SVG is at most 30 KB, the navigation WebP is at most 50 KB, and the favicon is at most 25 KB. A measured visual-quality reason is required to revise a ceiling.
- Combined navigation brand assets are at least 85% smaller than the current 860 KB combined SVG while preserving approved visual quality.
- The production build no longer emits the combined 860 KB wordmark or the 2.9 MB mislabeled favicon.
- Preloading decisions are supported by request-order and largest-contentful-paint evidence rather than retained by habit.
- No application image-processing dependency or runtime transformation path is introduced.
- All portfolio photos expose AVIF first, WebP second, and JPEG fallback at 480/960/1440/2160 widths, preserving IDs, alt text, aspect ratios, orientation, and intrinsic geometry. There are 12 unique delivery candidates per current photo, with the JPEG `src` reusing its 1440 candidate and no imported editing original emitted for delivery.
- The displayed and preloaded candidate use the same supported format and sizes policy. Network traces show no systematic WebP preload followed by AVIF download for the same photo/size; any additional preview or responsive-upgrade request has an identified purpose. Existing neighbor-cache limits and navigation semantics pass regression checks.
- Visual review approves portrait and portfolio quality, including grain, fine texture, shadow detail, gradients, and color. AVIF aggregate bytes for the current corpus are lower than the existing WebP corpus at the approved visual quality; report the measured saving and any per-photo exceptions rather than assume a percentage.
- Actual source selection, JPEG fallback wiring, and graceful image-loading behavior are verified; simulated codec cases and unavailable actual-browser coverage are explicitly identified. A network error is not treated as native codec fallback.
- Build/output/storage costs and repeated browser transfer, LCP, and image-readiness measurements are recorded. Any consistent slowdown or quality/byte-budget conflict is resolved or explicitly accepted by the user before completion. Smaller encoded bytes alone are insufficient evidence of a runtime improvement.

## Verification

Before visual approval:

- `npm run test:unit -- src/app/wordmark.test.ts src/features/portfolio/photoCatalog.test.ts` plus any new asset or pure preload-policy tests.
- `npm run test:component -- --spec src/app/Navigation.cy.tsx,src/components/ResponsiveImage.cy.tsx,src/features/portfolio/HeroSlideshow.cy.tsx,src/features/portfolio/Lightbox.cy.tsx`
- `npm run lint`
- `npm run format:check`
- `npm run typecheck`
- `npm run build`
- File-signature, intrinsic-dimension, source-size, emitted-size, and gzip or Brotli comparison.
- Browser Network and Performance review on Home and one secondary route at representative mobile and desktop sizes.
- Visual inspection of the portrait crop, circle, lettering, active/hover state, alignment, loading stability, high-density sharpness, and browser favicon.
- Cold/warm build and output-count comparison, per-format photo bytes, actual `currentSrc`/MIME checks, and representative photo quality/decode/network review. Reuse Plan 015's test evidence and adopted environment tooling where applicable.

After the user approves the output and requests no further visual edits:

- `npm run test:e2e`
- `npm run security:audit`
- Full PR CI; run `npm run check` only for an explicit request or the repository's high-risk verification conditions. Do not label a command with no completed-test evidence as passing.

## Risks and recovery

| Risk                                            | Mitigation or recovery                                                                                                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Resizing softens the portrait                   | Review at the largest CSS size and 3× density; raise dimensions modestly within the byte budget if needed.                        |
| Split assets alter alignment or spacing         | Preserve explicit dimensions and compare component geometry at current breakpoints before approval.                               |
| Vector cleanup clips Zina letterforms           | Tighten the view box with measured padding and compare every edge against the approved wordmark.                                  |
| Preloads compete with the Home hero             | Compare request priority and LCP before retaining, removing, or narrowing each hint.                                              |
| Asset budgets become compressor-specific        | Assert conservative ceilings and format integrity, not exact byte counts or hashes.                                               |
| Favicon caches hide the replacement             | Verify in a clean profile or cache-disabled request and retain rollback to the previous link until review.                        |
| AVIF blurs grain or alters dark detail          | Review representative crops and full-size display against originals/current delivery; tune AVIF separately before adoption.       |
| Encoding or decoding outweighs transfer savings | Measure build effort and real browser readiness; adjust settings or seek a decision with evidence.                                |
| Preloader and display request different codecs  | Share ordered source ownership and sizes, inspect actual network requests, and preserve cache/preview regression coverage.        |
| A selected AVIF URL fails to load               | Preserve existing error/transition behavior and validate emitted URLs; do not assume the browser automatically retries WebP/JPEG. |
| Candidate duplication inflates storage          | Verify 12 distinct outputs per photo and reuse the 1440 JPEG fallback; inspect emitted files rather than infer from source sets.  |

## Definition of done

- All source, build, transfer, visual, accessibility, and request-priority acceptance criteria are satisfied.
- Focused checks pass before visual review, the user approves the assets in browser, and final E2E and release checks pass afterward.
- The repository contains no tracked imported copy of the former combined raster-in-SVG wordmark or mislabeled multi-megabyte favicon.
- The final diff contains only this ticket's brand/photo assets, build/catalog/preload integration, regression coverage, and documentation. If rollout must be reversed, restore the prior ordered WebP/JPEG contract and matching preload policy together; the brand optimization can remain independently valid.
- The implementation record and plan index include final measurements, verification evidence, and the PR link.

## Implementation record

Implementation started on 2026-09-15 after PR #44 merged. The user selected AVIF → WebP → JPEG for portfolio photographs, retaining four widths per format, and approved the complete plan.

Current evidence:

- The original embedded JPEG is 6000 × 4000 pixels. The first extraction mistakenly took a 427 × 418 crop from its upper-left corner and removed the dark silhouette. The corrected navigation portrait uses the source's centered 4000 × 4000 crop, preserving the visible silhouette and colored background: 192 × 192 WebP (3,546 bytes) and 64 × 64 PNG favicon (6,424 bytes). The vector-only wordmark is 3,085 bytes (1,151 bytes gzip); the old combined SVG and mislabeled favicon were 880,049 and 3,001,487 bytes. Chrome visual review at 1280 × 720 and 390 × 844 confirmed the corrected silhouette, circular crop, lettering, and alignment; the user approved the result on 2026-09-15.
- Vite 8.2.2 with Sharp 0.35.4 successfully emitted 48 AVIF, 48 WebP, and 48 JPEG portfolio candidates: 1,344,619, 2,867,232, and 5,805,916 bytes respectively. AVIF quality 50 and effort 4 reduced the current 12-photo corpus by 53.1% relative to WebP quality 82; compared with effort 6, that is a 10,906-byte (0.82%) increase. A cold local build under Node 22.22.2 completed in 11.75 seconds, and the reported Cloudflare Workers build completed in 1 minute 7 seconds. The user accepted that build-time tradeoff; final photographic review remains tied to the production preview.
- The reported hard-refresh regression was caused by the development server generating responsive AVIF variants on demand rather than serving the production build's static assets. A same-candidate local request took 564 ms through the Vite development path versus 190 ms for WebP, while production-preview AVIF requests were served in 4–49 ms. The user approved keeping development and production AVIF settings identical and using `npm run preview` for representative pre-deployment performance review instead of adding a divergent development format or quality path.
- In a cache-disabled Chrome production-preview run at 1280 × 720, DOM content loaded in 51 ms and the load event completed in 112 ms. The three initially requested portfolio AVIFs completed in 15–49 ms; the lightbox reached ready state in 499 ms and one forward navigation in 308 ms while retaining the three-forward/two-backward native `<picture>` preload window. The selected `currentSrc` and all five resolved preloads were AVIF, so the earlier WebP-preload/AVIF-display duplication was not present.
- Verification under Node 22.22.2 passed: 44 unit tests with the coverage gate, lint, formatting, application/Cypress type checks, 22 affected Chrome component tests, production build, 14 production portfolio E2E tests against a freshly restarted preview, and the production dependency audit with no vulnerabilities. React 18's priority hint is rendered with the lowercase native `fetchpriority` attribute to avoid the previous unknown-property console warning. The user approved photographic quality and production-preview performance on 2026-09-15. PR [#45](https://github.com/avidixit27/avi-dixit.com/pull/45) is open for review.

Technical references: [native image-format selection](https://html.spec.whatwg.org/multipage/images.html#image-format-based-selection), [Sharp AVIF output options](https://sharp.pixelplumbing.com/api-output/#avif), and [AVIF decoding and delivery considerations](https://web.dev/articles/avif-updates-2023).
