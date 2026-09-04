# 005 — Establish responsive media and a performance baseline

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| Type           | Feature                                |
| Status         | Tracked in the [plan index](README.md) |
| Depends on     | 004                                    |
| Blocks         | 006, 007, and media-heavy feature work |
| Planned branch | `feat/responsive-media-foundation`     |
| PR base        | `chore/toolchain-modernization`        |
| PR             | Not opened                             |

## Outcome

The current portfolio no longer serves full-resolution originals for every browser context. Images reserve their layout space, select an appropriate responsive source, and follow an intentional loading policy. A repeatable baseline records the cost of media, JavaScript, layout, and scrolling before visual and motion work begins.

## Prerequisites and current state

- The production build currently emits approximately 150 MB, almost entirely from twelve 10–14 MB JPEG originals.
- `HeroSlideshow` mounts eight full-resolution images in the viewport. `BlurImage` supports only `src`, `alt`, lazy loading, and a class name; the catalog has no dimensions or responsive variants.
- Vite route chunks are already lazy loaded. No responsive image generator, bundle visualizer, CDN, or remote media service is configured.
- Media hosting, CDN provider, and backend remain open decisions. This ticket must not assume AWS, S3, CloudFront, or a backend repository.
- Plan 004 provides the supported Node and Vite baseline. Record the clean starting result of `npm run check`, `npm run security:audit`, and `npm run build` before changing media behavior.

## Scope

- Record production bundle sizes and representative desktop/mobile network behavior for the home route.
- Select one maintained, deterministic local derivative mechanism compatible with the installed Vite and Node versions. Compare a Vite image transform plugin with a small Sharp-based generation step; record why the chosen option fits local development, CI, and eventual CDN migration.
- Add typed, provider-neutral photo metadata for intrinsic dimensions, aspect ratio, alt text, and responsive sources.
- Produce AVIF or WebP derivatives with a JPEG fallback at widths justified by the current hero, lightbox, and one/two/three-column layouts.
- Update shared image rendering so `srcset`, `sizes`, width/height or aspect ratio, decoding, loading, and fetch priority are explicit inputs.
- Load only true first-view media eagerly. Inactive hero and below-the-fold gallery media must not all receive high priority.
- Preserve originals as editing sources while preventing them from being emitted as browser assets.
- Record post-change build and browser evidence plus the derivative-generation workflow.

## Non-goals

- Do not install Motion, change the visual theme, add parallax, redesign the portfolio, or build a CDN.
- Do not encode storage-provider URLs into React components.
- Do not migrate the full future photo library or solve owner publishing.
- Do not use client-side resizing of full originals as a substitute for delivery-sized assets.
- Do not add a permanent performance service or arbitrary Lighthouse score gate.

## Deliverables

- A recorded baseline and post-change comparison.
- Deterministic responsive derivatives for the current catalog and documented generation commands.
- Typed media metadata and an accessible responsive image contract.
- Updated hero, grid, and lightbox loading behavior with regression coverage.
- Documented provisional media budgets and follow-up limitations.

## Implementation plan

1. Run the existing checks and production build. Record total output, largest raster assets, route JavaScript, initial home-route requests, layout shift, and scroll/decode behavior on representative mobile and desktop viewports.
2. Evaluate the two local derivative approaches against Vite 5, Node 22, cacheability, reproducibility, security, and future replacement by CDN URLs. Add only the chosen dependency and command.
3. Extend the photo catalog with stable IDs, intrinsic dimensions, aspect ratio, alt text, and responsive source data. Keep URL construction outside presentation components and independent of a storage vendor.
4. Generate the smallest useful set of current-layout variants. Start with 480, 960, 1440, and 2160 pixel width candidates; remove any tier that browser evidence shows is redundant.
5. Replace original browser imports with responsive sources. Reserve layout space and set accurate `sizes` for hero, grid, and lightbox contexts.
6. Give the first hero image high priority, prepare only the next image needed for a smooth rotation, and keep inactive hero and below-the-fold grid media from competing with first paint.
7. Add or update Cypress component and browser tests for source selection attributes, loading priority, unchanged gallery behavior, and mobile layout stability.
8. Rebuild and profile the same scenarios. Record achieved sizes, visual-quality observations, deviations from the provisional budget, and any remaining source-management limitation.

## Acceptance criteria

- No original 10–14 MB portfolio JPEG is emitted into the production browser bundle.
- Current responsive images expose intrinsic dimensions and meaningful `srcset`/`sizes` values, with a broadly supported fallback.
- The initial home view does not eagerly prioritize all eight hero photographs or the below-the-fold grid.
- Image containers do not visibly collapse or jump while loading.
- Current gallery open, navigate, close, keyboard, mobile, and reduced-motion journeys remain intact.
- URL and media metadata ownership can later point to a CDN without rewriting visual components.
- The post-change production media output is materially below the approximately 150 MB baseline. Provisional targets are no individual derivative above 2 MB and no more than 25 MB for all current emitted portfolio derivatives; any visual-quality-driven exception is measured and recorded.
- No production dependency advisory at moderate or higher severity is introduced.

## Verification

- `npm run check`
- `npm run security:audit`
- `npm run build`
- Inspect `dist` totals and largest emitted media before and after.
- Review first-load and cached network requests at mobile and desktop sizes.
- Review hero, grid, and lightbox at normal and throttled network speeds.
- Confirm generated media is reproducible from a clean checkout in CI.

## Risks and recovery

| Risk                                          | Mitigation or recovery                                                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Compression damages photographs               | Compare crops, gradients, texture, and shadow detail against originals; raise quality only for demonstrated artifacts. |
| Generation slows every build                  | Cache deterministic output or separate generation from unchanged builds while keeping clean-checkout reproduction.     |
| Responsive metadata becomes provider-specific | Keep a narrow media contract and map local or future CDN sources into it.                                              |
| Hero crossfades reveal unloaded frames        | Preload only the next frame and retain the current frame until its replacement decodes.                                |
| A plugin conflicts with Vite 5                | Use the evaluated Sharp generation path or stop and record the toolchain prerequisite.                                 |

## Definition of done

- Acceptance criteria pass, baseline and post-change evidence are recorded, and generated outputs are reproducible.
- Relevant checks and security scanning pass locally and in CI.
- The diff contains only media/performance scope, and documentation reflects the implemented contract.
- The PR and plan index contain final status and links.

## Implementation record

Not started. Record the selected derivative approach, before/after measurements, loading decisions, visual review, commands, CI evidence, remaining limitations, and PR link.
