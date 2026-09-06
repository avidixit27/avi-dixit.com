# 005 — Establish responsive media and a performance baseline

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Type           | Feature                                                    |
| Status         | Tracked in the [plan index](README.md)                     |
| Depends on     | 004                                                        |
| Blocks         | 006, 007, and media-heavy feature work                     |
| Planned branch | `feat/responsive-media-foundation`                         |
| PR base        | `fix/dependabot-compatibility-guards`                      |
| PR             | [#16](https://github.com/avidixit27/avi-dixit.com/pull/16) |

## Outcome

The current portfolio no longer serves full-resolution originals for every browser context. Images reserve their layout space, select an appropriate responsive source, and follow an intentional loading policy. A repeatable baseline records the cost of media, JavaScript, layout, and scrolling before visual and motion work begins.

## Prerequisites and current state

- The production build currently emits approximately 150 MB, almost entirely from twelve 10–14 MB JPEG originals.
- `HeroSlideshow` mounts eight full-resolution images in the viewport. `BlurImage` supports only `src`, `alt`, lazy loading, and a class name; the catalog has no dimensions or responsive variants.
- Vite route chunks are already lazy loaded. No responsive image generator, bundle visualizer, CDN, or remote media service is configured.
- Media hosting, CDN provider, and backend remain open decisions. This ticket must not assume AWS, S3, CloudFront, or a backend repository.
- Plan 004 provides the supported Node 22/24 and Vite 8 baseline. Record the clean starting result of `npm run check`, `npm run security:audit`, and `npm run build` before changing media behavior.

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
2. Evaluate the two local derivative approaches against Vite 8, Node 22/24, cacheability, reproducibility, security, and future replacement by CDN URLs. Add only the chosen dependency and command.
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
| A plugin conflicts with Vite 8                | Use the evaluated Sharp generation path or stop and record the toolchain prerequisite.                                 |

## Definition of done

- Acceptance criteria pass, baseline and post-change evidence are recorded, and generated outputs are reproducible.
- Relevant checks and security scanning pass locally and in CI.
- The diff contains only media/performance scope, and documentation reflects the implemented contract.
- The PR and plan index contain final status and links.

## Implementation record

Implemented on `feat/responsive-media-foundation` from `fix/dependabot-compatibility-guards` at `75bd5cc`.

### Baseline and approach

The Plan 004 production build emitted approximately 150 MB. Its twelve 6000×4000 editing originals occupied 153,092,098 bytes, and the largest original was 14,123,008 bytes. The home route mounted eight original hero images, discovered orientation by loading photographs in the browser, and exposed no responsive source metadata.

Two local derivative approaches were evaluated. A custom Sharp script would provide low-level control but would add a generator and output-management workflow that the application would own. `vite-imagetools` 12 is compatible with the installed Node 22 and Vite 8 baseline, uses Sharp internally, integrates transforms with Vite's content hashing and cache, strips metadata by default, and supports the existing eager glob catalog. The Vite plugin was selected to keep generation in the existing build command and avoid committing 96 generated binaries. The typed catalog remains the replacement boundary for a future CDN.

### Implemented behavior

- `vite.config.mts` centrally defines 480, 960, 1440, and 2160 pixel responsive widths, a 1440 pixel JPEG fallback, and quality 82. `npm run build` is the derivative-generation command.
- Every catalog entry now has a stable ID, meaningful alternative text, intrinsic dimensions, aspect ratio, a JPEG `srcset`, and a WebP source. Presentation components receive URLs through this contract and do not import originals.
- `ResponsiveImage` makes sources, sizes, dimensions, decoding, loading, and fetch priority explicit. The hero and lightbox use `100vw` and `95vw`; the grid's sizes match its one-, two-, and three-column breakpoints.
- The hero mounts only its active and next images. Only the initial active image receives high priority, and rotation waits until the next image has loaded. Grid media is lazy and low priority; an opened lightbox image is eager and high priority.
- Catalog dimensions replaced browser-side orientation loading, so rendering no longer decodes every original merely to identify landscape images.

### Results and verification

The production build emits 96 hashed derivatives: four widths in JPEG and WebP for each of twelve photographs. They total 8,673,148 bytes; the entire `dist` directory is 12,775,083 bytes, and the largest derivative is 520,052 bytes. This reduces total build output by about 91% and portfolio media by about 94%. No original 10–14 MB JPEG is emitted. A cold build after removing the image-transform cache reproduced identical filenames and SHA-256 content hashes and completed in 6.24 seconds.

Component and browser tests cover responsive markup, intrinsic dimensions, loading priority, the two-image hero window, readiness-gated rotation, gallery behavior, mobile access, and reduced-motion rendering. The portrait and representative landscape derivatives were reviewed at full generated resolution; orientation, film texture, gradients, highlights, and shadow detail remain suitable at quality 82. `npm run check`, `npm run security:audit`, and the full development-dependency `npm audit --audit-level=moderate` pass locally on Node 22.23.2. Pull-request CI results are recorded on [PR #16](https://github.com/avidixit27/avi-dixit.com/pull/16).

The editing originals still occupy approximately 146 MB in Git. Their long-term source storage and any CDN remain open. The current build cost is dominated by image transformation on a clean cache; subsequent plans should measure it as the catalog grows rather than increasing derivative tiers preemptively.

### Lightbox interaction follow-up

A 12-second desktop recording after the initial implementation exposed a perceptible blank interval between opening the overlay and decoding the selected lightbox source. It also showed that backdrop dismissal was not reliably available across the surrounding area. These are Plan 005 delivery and E2E regressions rather than a separate visual feature.

The hero and grid now pass the selected image element's `currentSrc` into portfolio-owned selection state. The lightbox paints that already-rendered source immediately, loads the larger responsive image in the same bounded layout slot, and crossfades only after the larger image fires `load`. It also preloads the two eligible adjacent JPEG fallbacks so keyboard and arrow navigation have an immediate preview. The shared responsive component gained only a presentation-level picture class input; selection and preloading remain owned by the portfolio feature.

The accessible full-screen backdrop button now owns outside-click dismissal. The photograph sits above it and does not close the dialog when clicked; the existing close button, Escape key, and navigation controls remain independent. Cypress component coverage verifies the immediate preview source, image-click behavior, backdrop closing, navigation preview handoff, and existing cleanup. The production E2E suite verifies the clicked grid source is reused and that image and backdrop clicks have distinct outcomes.

A second 17-second desktop recording showed that the initial follow-up was incomplete. Manual browser testing reproduced the three remaining defects and identified their rendered causes:

- The hero removed its outgoing element at the same moment the incoming element became active. The slideshow now retains the outgoing photograph for the 700 millisecond crossfade and removes it afterward, so the incoming image always fades over a painted photograph rather than the page background.
- HTML width and height attributes combined with `object-contain` made a portrait image's clickable element box approximately 95% of the viewport even though the visible photograph was much narrower. Explicit automatic CSS dimensions now preserve the intrinsic ratio while applying viewport maximums, and the transparent stacking wrapper ignores pointer input. In an 819×861 browser viewport, clicking the visible side area beside the portrait closed the dialog while clicking the photograph did not.
- Browser inspection confirmed that each grid image resolves to one WebP `currentSrc`; the grid was not deliberately swapping a low-resolution and high-resolution layer. The cards instead kept `transform-gpu`, `will-change: transform`, and paint containment active for the entire gallery. Those permanent compositing hints were removed while retaining the hover transition. Manual production-build review scrolled down through both gallery sections and back up without reproducing the repaint flicker.

The Cypress regression now keeps the outgoing hero element present through the crossfade, verifies normal card compositing, waits for a lazy portrait to resolve its source, uses browser hit testing beside the visible portrait, and confirms that the hit target is the accessible backdrop.

A third desktop recording exposed a lightbox size jump and an intermittent flash while moving through photographs. Responsive candidates have different intrinsic pixel widths, so allowing each image layer to size the grid made the clicked thumbnail preview and larger viewer source produce different rendered boxes. The lightbox now calculates one stage from the selected photograph's catalog dimensions and the 95% viewport limits; both layers fill that exact stage. The larger layer remains transparent until `HTMLImageElement.decode()` settles, preventing the preview from fading before the replacement frame is paintable. Component coverage holds decode pending and verifies both layer visibility and unchanged stage geometry, while production E2E coverage repeats navigation and verifies stable dimensions. Repeated immediate navigation was also reviewed manually in the production build at 1280×720 without reproducing either jump or flash.

A fourth recording clarified that the remaining perceived flicker was the visible sharpness change between the selected grid source and the decoded fullscreen source, amplified by repeated navigation. The selected source is now presented as an intentional blurred placeholder and crossfades to the sharp source over 300 milliseconds. Previous and next controls, including arrow-key navigation, remain unavailable while that selected full-resolution frame decodes and completes the crossfade; close and backdrop dismissal remain immediate. This keeps one low-cost placeholder and one responsive fullscreen image mounted, prevents queued navigation from cycling through unresolved frames, and adds no dependency or animation runtime. Component coverage verifies the busy state, blurred placeholder, navigation gate, decode handoff, and stable stage.

A fifth recording showed why the temporary navigation gate was insufficient: disabled-state opacity made both arrows pulse, and replacing the current photograph immediately still exposed the black overlay beneath the incoming layer. The final lightbox lifecycle retains the outgoing decoded fullscreen source above the incoming image until the incoming source decodes. The incoming image then becomes opaque behind the outgoing frame, which fades away over 300 milliseconds. Repeated pointer and keyboard input is ignored through an immediate ref lock, while the controls remain mounted with unchanged styling and communicate temporary unavailability through `aria-disabled`. The grid preview is limited to the initial opening; adjacent navigation mounts only the outgoing and incoming fullscreen layers. This loading lifecycle remains independent of the future Motion presentation layer.

A sixth recording isolated the last visible flicker to the first-open handoff; adjacent carousel navigation was already smooth. The cause was the simultaneous fade between two image layers over the black viewer backdrop, which briefly reduced their combined painted opacity. The initial grid source now remains sharp and fully opaque above the decoded fullscreen image. Once decoding completes, the fullscreen image becomes opaque behind that preview and only the preview fades away. The same opaque-underlay rule applies to adjacent images while retaining the established outgoing-frame lifecycle. Component coverage verifies layer order, uninterrupted preview coverage, removal after the handoff, and the absence of an opacity transition on the decoded underlay.

A seventh recording showed reduced navigation throughput under repeated fast clicks. The existing preloader prepared only two adjacent 1440-pixel JPEG fallbacks even though the responsive viewer normally selected WebP, and its transition lock discarded input received during the handoff. The lightbox now keeps a bounded cache of three forward and two backward neighbors, assigns the same WebP `srcset` and `95vw` sizing used by the viewer, calls `decode()`, and releases application references outside the rolling window. Rapid input accumulates as a signed destination offset; after the current 250 millisecond handoff, the viewer advances to the requested destination instead of replaying a long animation queue or dropping clicks. The current catalog has eleven eligible landscape photographs. Its 2160-pixel WebP derivatives average 132 KB compressed, while each decoded 2160×1440 frame is approximately 12 MB. The steady six-frame working set therefore averages less than 1 MB of compressed transfer and approximately 71 MB of decoded pixels at the largest candidate; at 1440 pixels, decoded pixels are approximately 32 MB. A transition can temporarily retain one additional outgoing frame, and the browser ultimately controls decoded-surface eviction. Only the current and outgoing frames are mounted in the viewer. Unit coverage verifies offset wrapping and window order, while component coverage verifies responsive candidate selection, decoding, the five-entry bound, and retained rapid navigation intent.
