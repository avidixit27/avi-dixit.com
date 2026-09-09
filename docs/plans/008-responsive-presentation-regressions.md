# 008 — Fix responsive presentation regressions

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Type           | Fix                                                        |
| Status         | Completed                                                  |
| Depends on     | 007                                                        |
| Blocks         | 009 and 010                                                |
| Planned branch | `fix/responsive-presentation-regressions`                  |
| PR base        | `main`                                                     |
| PR             | [#25](https://github.com/avidixit27/avi-dixit.com/pull/25) |

## Outcome

Brand typography, the full-screen hero, and lightbox controls render intentionally across mobile and wide viewports. The repository uses the freely licensed Zen Tokyo Zoo display font and one clear Vite-managed asset structure, hero photographs match the viewport orientation, and the mobile close control no longer clips into the photograph.

## Prerequisites and current state

- Plan 007 supplies the final Tailwind 4 token mechanism and simplified Vite integration.
- The header SVG contains live text that requests the unavailable commercial `Phosphate-Inline` font. External SVG images cannot reliably inherit the page's loaded font, so affected devices render a fallback.
- The user supplied `ZenTokyoZoo-Regular.ttf` and its SIL Open Font License 1.1. The source and license are preserved under `src/assets/fonts/` during planning.
- Hero images currently fill the viewport with `object-cover` regardless of source orientation. This heavily crops portrait photographs on wide viewports and landscape photographs on portrait viewports.
- The lightbox derives the close button's vertical position from the image rectangle. On constrained screens that position can overlap or clip into the image/control boundary.
- Browser review must reconfirm all three failures at representative mobile and desktop viewports before code changes.

## Scope

- Make Zen Tokyo Zoo the sole project display typeface. Remove all Phosphate references and avoid unsupported display weights, except for the user-approved bold navigation-label treatment.
- Convert the source TTF to WOFF2 for browser delivery, preserve `OFL.txt`, define one global `@font-face`, and point the Tailwind `font-display` token at it. Use `font-display: swap` and a deliberate fallback.
- Convert the `avi dixit` SVG wordmark lettering to Zen Tokyo Zoo vector paths so the imported SVG is independent of runtime font availability.
- Consolidate Vite-imported media under `src/assets/`: `brand/`, `fonts/`, `icons/`, and `photography/portfolio/`. Update imports, image globs, lint ignores, preload references, tests, and documentation once; leave root-addressed files such as `public/favicon.ico` in `public/`.
- Select hero candidates whose intrinsic orientation matches the viewport orientation, preserving catalog order and slideshow wrapping. Use the existing full-bleed presentation and a deterministic fallback if one orientation has no eligible image.
- Reserve a viewport-safe mobile control area for the lightbox close button. Keep the button visible, reachable, and separate from image content while preserving desktop placement where adequate space exists.
- Add regression coverage before implementing each behavior and verify with real browser interaction.

## Non-goals

- Do not redesign the navigation, replace the embedded portrait artwork, change gallery media quality, or change slideshow timing.
- Do not apply Zen Tokyo Zoo to body copy; the global replacement applies to all display/brand roles and removes Phosphate from the repository.
- Do not introduce a font package, remote font request, general asset registry, CDN, or backend media service.
- Do not add Motion or implement the dark/footer redesign.
- Do not force every photograph to display uncropped; the hero remains full bleed with orientation-aware candidate selection.

## Deliverables

- Licensed, self-hosted Zen Tokyo Zoo WOFF2 asset and retained OFL license.
- One global font definition and display token with no remaining Phosphate references.
- Portable path-based header wordmark.
- Consolidated `src/assets` directory with updated source and build references.
- Orientation-aware hero selection and viewport-safe lightbox close control.
- Focused unit/component/E2E regressions and mobile/desktop browser evidence.

## Implementation plan

1. Reproduce and record the font fallback, mismatched hero orientation, and close-control overlap at portrait mobile and landscape desktop sizes. Write focused failing tests for observable behavior.
2. Move bundled media into the agreed `src/assets` categories, update imports/globs/preloads, and verify that Vite still generates responsive portfolio candidates rather than shipping originals.
3. Convert the supplied TTF to WOFF2 without adding a repository build dependency, retain the OFL, add the global `@font-face`, and update `--font-display`. Remove synthetic `font-semibold` from display uses that would distort the regular-only face.
4. Replace the SVG's live Phosphate text with Zen Tokyo Zoo outlines. Preserve its viewBox, embedded portrait proportions, accessible use through the parent link, and preloaded URL.
5. Add a small pure orientation-selection policy beside the portfolio catalog. Use intrinsic dimensions and viewport orientation, retain stable order/wrapping, and define the all-images fallback.
6. Update the hero to consume the eligible sequence without remount flashes, timer duplication, or eager loading of the whole catalog.
7. Give the lightbox a mobile control gutter using safe-area-aware viewport spacing; clamp desktop placement and preserve Escape, backdrop click, focus, and touch behavior.
8. Run focused tests, build/media verification, and interactive browser review at mobile, tablet, landscape laptop, and wide desktop sizes.

## Acceptance criteria

- No runtime source, active SVG style, test, or dependency requests Phosphate.
- Zen Tokyo Zoo loads locally with no third-party font request and is used by every display/brand role; body copy remains on the readable sans-serif stack.
- The header wordmark renders consistently even when webfonts are disabled because its lettering is outlined.
- All Vite-imported fonts, branding, icons, and portfolio photography have one obvious home under `src/assets`; `public` contains only fixed root-addressed assets.
- Landscape viewports rotate through landscape hero candidates and portrait viewports rotate through portrait candidates, with deterministic fallback behavior.
- The hero remains full bleed and preserves smooth first load, crossfades, timing, and reduced-motion behavior.
- The lightbox close button remains fully visible, at least 44 by 44 CSS pixels, safe-area aware, keyboard reachable, and visually separate from the image on small screens.
- Responsive-image generation, lightbox navigation/preloading, backdrop close, and current routes remain functional.

## Verification

Focused and structural checks:

```bash
rg -ni "phosphate|src/imgs" src index.html package.json
npm run test:unit
npm run test:component
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Browser review:

- Verify the wordmark and display headings with cache disabled and fonts initially uncached.
- Exercise the hero at portrait mobile, mobile landscape, tablet, laptop, and wide desktop sizes through multiple full rotations.
- Open portrait and landscape photographs in the lightbox, resize while open, and verify the close button through touch, keyboard, backdrop click, and safe-area emulation.
- Inspect the Network panel for local WOFF2 delivery, responsive photographs, and absence of editing-original downloads.

## Risks and recovery

| Risk                                                           | Mitigation or recovery                                                                                                        |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Font conversion or outlining changes the licensed name/artwork | Preserve the OFL, use the supplied face without redesigning glyphs, and visually compare rendered live text with the outline. |
| Asset moves break Vite globs or emit originals                 | Update all references atomically, build, and inspect generated sources before accepting the move.                             |
| Orientation filtering repeats too few photographs              | Preserve deterministic fallback and record the available count for each orientation.                                          |
| Viewport changes desynchronize the slideshow                   | Derive eligibility from one owned media-query state and test index recovery on orientation changes.                           |
| Close-control spacing reduces image area excessively           | Reserve only the minimum accessible control gutter on constrained viewports and retain desktop geometry when space permits.   |

## Definition of done

- All three reproduced regressions satisfy the acceptance criteria and their focused tests pass.
- Asset paths, licensing, architecture, and plan records match the final implementation.
- Relevant local verification and complete pull-request CI pass.
- The diff contains only asset organization, typography, and the three responsive fixes.
- The PR and plan index contain final status and links.

## Implementation record

Completed in [#25](https://github.com/avidixit27/avi-dixit.com/pull/25). The approved TTF was converted with `fonttools ttLib.woff2 compress` into `src/assets/fonts/ZenTokyoZoo-Regular.woff2`; `OFL.txt` is retained beside it. Vite-imported branding, icons, and portfolio editing sources now live under `src/assets/`, with the wordmark lettering converted to paths generated from the supplied Zen Tokyo Zoo face. The orientation selector preserves source order, selects matching intrinsic orientations, and falls back to the full catalog when no match exists. The close control uses a 44px safe-area-aware fixed target rather than image-rectangle positioning.

The user also requested a heavier, larger navigation mark and bold navigation labels. The outlined wordmark uses a rounded stroke and a vertically centered baseline within its existing viewBox; the navigation uses responsive logo sizing and label spacing so Home, Shop, and Contact remain visible on mobile. Local verification passed `format:check`, lint, typecheck, unit tests (8), component tests (15), production build, and E2E tests (7); pull-request CI remains the completion gate.
