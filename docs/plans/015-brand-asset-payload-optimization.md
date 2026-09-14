# 015 — Optimize brand asset payloads

| Field          | Value                                                                       |
| -------------- | --------------------------------------------------------------------------- |
| Type           | Performance fix                                                             |
| Status         | Tracked in the [plan index](README.md)                                      |
| Depends on     | [014 — UI stability regressions](014-ui-stability-regressions.md)           |
| Blocks         | [016 — Feature availability controls](016-feature-availability-controls.md) |
| Planned branch | `perf/brand-asset-payloads`                                                 |
| PR base        | `main`                                                                      |
| PR             | Not opened                                                                  |

## Outcome

The navigation retains its approved portrait-and-wordmark design while loading small assets appropriate to their rendered size. The wordmark contains vector lettering only, the portrait is a separately compressed WebP with the same crop, and the favicon has a truthful format and practical dimensions. Production no longer transfers full-resolution raster data embedded in an SVG.

## Prerequisites and current state

- Complete Plan 014 first because it changes same-route behavior on the same navigation link. Begin this plan from the merged Plan 014 state rather than stacking unreviewed navigation changes.
- `src/assets/brand/avi-dixit-wordmark.svg` is approximately 860 KB and is emitted at approximately the same size in the production build. Its gzip size is approximately 483 KB.
- The SVG contains vector paths for the Zina wordmark and an embedded base64 JPEG of approximately 649 KB. The raster is displayed at roughly 48–56 CSS pixels high, so the source resolution and encoding are disproportionate to its use.
- The prior production JavaScript entry was approximately 100 KB gzip. The compressed combined wordmark alone is therefore nearly five times that entry payload.
- `public/favicon.ico` is actually a 4066 × 4000 RGBA PNG stored with an `.ico` extension and weighs approximately 2.9 MB.
- `index.html` preloads the combined wordmark at high priority on every route. Reassess that hint after splitting the asset so it does not compete unnecessarily with the Home hero.
- The approved portrait source is the exact image currently embedded in the wordmark. Preserve its crop and visual appearance, resize it for navigation use, encode it as WebP, and create the favicon from the same portrait.
- Same-sized untracked files whose names contain `-optimized` are experiments rather than plan inputs. Preserve unrelated user files and do not adopt or delete them without an explicit decision.

## Scope

- Extract the current embedded portrait without altering its crop, color, or subject placement.
- Produce a committed navigation WebP sized for the displayed portrait and common high-density screens. Prefer one appropriately sized source over a responsive asset family unless browser measurement demonstrates a visible need for multiple variants.
- Convert the existing wordmark asset to a tight, text-only SVG containing the approved Zina vector paths and neutral navigation color.
- Compose the portrait and vector lettering inside the existing single Home link with explicit intrinsic dimensions and the current responsive alignment.
- Replace the mislabeled oversized favicon with a correctly encoded, small favicon derived from the same portrait and update `index.html` metadata.
- Reevaluate image preload and fetch-priority hints against the Home hero request order.
- Add meaningful source and production asset budgets that prevent embedded raster data or multi-megabyte icons from returning.
- Record source, gzip or Brotli, emitted build, and request-priority measurements before and after the change.

Anticipated ownership includes `src/assets/brand/`, `src/app/Navigation.tsx`, `src/app/wordmark.test.ts`, `public/`, `index.html`, and affected navigation component or production browser coverage. Do not add an image-processing runtime dependency for committed static outputs.

## Non-goals

- Do not redesign the portrait, change the wordmark typography, recolor the navigation, or alter its approved alignment and sizing.
- Do not modify the signature logo or portfolio photography pipeline.
- Do not retain a high-resolution portrait in an imported frontend asset merely for possible future reuse.
- Do not introduce a general image component, asset manifest, CDN, service worker, or runtime image transformation system.
- Do not add Apple touch icons, social-preview images, a web manifest, or broader metadata work unless separately approved.
- Do not optimize for the smallest possible byte count at the expense of a visibly degraded portrait.

## Deliverables

- Text-only Zina wordmark SVG with no embedded raster or font dependency.
- Efficient WebP navigation portrait preserving the current crop.
- Correctly encoded and sized favicon using the same portrait.
- Navigation composition preserving one accessible Home link and stable intrinsic layout.
- Focused asset-integrity and byte-budget regression tests.
- Before-and-after build and browser-transfer evidence.

## Implementation plan

1. Capture baseline source sizes, compressed sizes, emitted asset sizes, Home request order, and the navigation's rendered dimensions at representative mobile and desktop device-pixel ratios.
2. Extend the existing wordmark test so it fails while the SVG contains an `<image>`, a `data:image` value, unnecessary editor metadata, or exceeds the approved vector byte budget. Preserve the existing assertions for path-based Zina lettering and its neutral color.
3. Extract the embedded JPEG exactly once, preserve the visible square crop, resize it to 192 × 192 pixels, and encode a visually reviewed WebP. Commit only the delivery asset and record its provenance; do not add conversion tooling to the application dependency graph.
4. Remove the raster and obsolete Adobe wrapper content from the wordmark SVG, tighten its view box to the lettering, preserve vector paths, and keep `currentColor` or the established neutral fill according to the simplest composition that retains current hover and active behavior.
5. Compose the portrait and text-only SVG within the existing Home link. Give each image explicit width and height, apply the circular crop to the portrait with CSS, keep decorative child images out of the accessibility tree, and retain one descriptive accessible name on the link.
6. Add or update navigation component coverage for visual ordering, intrinsic geometry, responsive vertical alignment, link semantics, and the active/hover color behavior already protected by the suite.
7. Generate a 64 × 64 PNG favicon from the same crop, name it with the `.png` extension, update the icon link with its correct MIME type and dimensions, and remove the obsolete oversized mislabeled file from tracked production assets.
8. Add focused integrity checks for the WebP and PNG signatures and conservative byte ceilings. Use budgets as regression safeguards rather than assertions for an exact compressor output.
9. Build production and compare the emitted assets and compressed transfer estimates. Inspect browser request priority on Home and secondary routes; retain only preload hints that improve brand stability without delaying the hero's largest-contentful image.
10. Run focused lint, formatting, type, unit, and component checks, then review the navigation and favicon in a real browser on standard and high-density mobile and desktop viewports.
11. Ask the user to approve crop quality, alignment, color, and sharpness. After approval, run production E2E and the full release checks and record the final size reduction.

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

## Verification

Before visual approval:

- Focused Vitest asset tests and Cypress navigation component tests.
- `npm run lint`
- `npm run format:check`
- `npm run typecheck`
- `npm run build`
- File-signature, intrinsic-dimension, source-size, emitted-size, and gzip or Brotli comparison.
- Browser Network and Performance review on Home and one secondary route at representative mobile and desktop sizes.
- Visual inspection of the portrait crop, circle, lettering, active/hover state, alignment, loading stability, high-density sharpness, and browser favicon.

After the user approves the output and requests no further visual edits:

- `npm run test:e2e`
- `npm run check`
- `npm run security:audit`

## Risks and recovery

| Risk                                     | Mitigation or recovery                                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Resizing softens the portrait            | Review at the largest CSS size and 3× density; raise dimensions modestly within the byte budget if needed. |
| Split assets alter alignment or spacing  | Preserve explicit dimensions and compare component geometry at current breakpoints before approval.        |
| Vector cleanup clips Zina letterforms    | Tighten the view box with measured padding and compare every edge against the approved wordmark.           |
| Preloads compete with the Home hero      | Compare request priority and LCP before retaining, removing, or narrowing each hint.                       |
| Asset budgets become compressor-specific | Assert conservative ceilings and format integrity, not exact byte counts or hashes.                        |
| Favicon caches hide the replacement      | Verify in a clean profile or cache-disabled request and retain rollback to the previous link until review. |

## Definition of done

- All source, build, transfer, visual, accessibility, and request-priority acceptance criteria are satisfied.
- Focused checks pass before visual review, the user approves the assets in browser, and final E2E and release checks pass afterward.
- The repository contains no tracked imported copy of the former combined raster-in-SVG wordmark or mislabeled multi-megabyte favicon.
- The final diff contains only this ticket's assets, navigation integration, regression coverage, and documentation.
- The implementation record and plan index include final measurements, verification evidence, and the PR link.

## Implementation record

Not started. On implementation, record extraction provenance, output dimensions and encoder settings, source and emitted sizes, compressed transfer estimates, preload decision, visual approval, commands, evidence, and PR link.
