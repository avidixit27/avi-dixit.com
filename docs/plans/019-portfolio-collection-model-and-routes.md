# 019 — Establish portfolio collection models and routes

| Field          | Value                                                                         |
| -------------- | ----------------------------------------------------------------------------- |
| Type           | Feature                                                                       |
| Status         | In review                                                                     |
| Depends on     | [018 — Portfolio statement and résumé](018-portfolio-statement-and-resume.md) |
| Blocks         | [020 — Portfolio discovery index](020-portfolio-discovery-index.md)           |
| Planned branch | `feat/portfolio-collection-routes`                                            |
| PR base        | `main`                                                                        |
| PR             | [#57](https://github.com/avidixit27/avi-dixit.com/pull/57)                    |

## Outcome

The current film portfolio remains the complete Home experience at `/`, while additional real bodies of work can live at short, stable `/portfolio/:slug` URLs. Projects share responsive gallery, slideshow, and lightbox behavior without being forced into the film portfolio's Entropy/Chaos editorial composition. Lightweight project metadata remains separate from image-heavy project content so adding destinations does not inflate the initial Home download.

## Prerequisites and current state

- Complete Plan 018 first because it adds a statement route and a Home-only closing section that belongs specifically to the current film body of work.
- `Portfolio.tsx` currently owns one catalog, one hero selection, one editorial composition, one grid, and one lightbox workflow. `photoCatalog.ts` combines reusable photo types and construction logic with one literal Vite glob and the film photo metadata.
- The current film portfolio remains at `/`. The wordmark and Home navigation continue to return to that experience.
- Additional projects use `/portfolio/:slug`. Slugs should usually contain two to four lowercase words separated by hyphens and must not exceed 32 characters. Prefer stable descriptive names such as `/portfolio/tokyo-night`; omit years or redundant location words unless needed to distinguish projects.
- City or destination is display and grouping metadata, not a required URL segment. Renaming a displayed location must not force a URL migration.
- Shared behavior includes responsive sources, hero slideshow, photo grid, lightbox, preload policy, accessibility, and media performance. Editorial copy, section order, selected editorial photographs, and motion composition remain project-owned and optional.
- Do not implement this ticket with only placeholder data. Before starting, the user must provide at least one additional real project's title, approved slug, destination, optional date or year, ordered source photographs, alt text or enough context to author it, hero selection, and any project-specific copy.

## Scope

- Define a narrow typed project summary containing stable ID, short slug, display title, destination, optional date label, route, and availability needed by discovery and routing.
- Keep lightweight summaries independent of photo imports, React components, and editorial implementations.
- Separate reusable photo catalog types and validation from each project's literal Vite image imports and photo metadata.
- Move the current film catalog and route composition into clearly named project ownership without changing its `/` URL, order, copy, motion, or approved visual behavior.
- Add one real secondary project at `/portfolio/:slug` to prove the model and avoid speculative architecture.
- Extract only the gallery orchestration that both real projects use: responsive hero, grid, lightbox selection, navigation, scroll lock, preload policy, and cleanup.
- Provide an explicit composition point for project-owned editorial sections without encoding layouts as a large configuration schema.
- Keep Home eager for first-hero performance and load secondary project code and photo catalogs only when their routes are visited.
- Handle unknown or unavailable project slugs through the existing 404 route.
- Add catalog, route, isolation, accessibility, and production-loading coverage.

Anticipated ownership includes `src/features/portfolio/` and focused project subdirectories, `src/assets/photography/`, `src/resources/navigation.ts`, `src/app/RouteTransitionBoundary.tsx`, and their existing unit, component, and E2E coverage. Final filenames should describe real project identities rather than generic numbered folders.

## Non-goals

- Do not replace Home with a project index, redirect `/` to a slug, or move the film portfolio away from `/`.
- Do not build a standalone portfolio index. The user replaced the compact dropdown experiment with a full-viewport navigation overlay whose secondary-project labels reveal approved cover photographs on hover or focus.
- Do not force every project to use the Entropy/Chaos sections, artist statement, résumé links, identical hero count, or identical page rhythm.
- Do not invent placeholder destinations, photographs, titles, descriptions, dates, or alt text.
- Do not add a CMS, database, API, backend repository, dynamic upload system, or runtime image service.
- Do not create a generic page builder, JSON component schema, route registry framework, or Context provider.
- Do not import every project's original photographs into the Home route or eagerly fetch secondary-project media.
- Do not add project authentication, drafts, search, filtering, tagging, or commerce associations.

## Deliverables

- Lightweight typed portfolio summary catalog with stable unique IDs, short slugs, destinations, and routes.
- Project-owned film and secondary-project content modules with literal, bounded image discovery.
- Shared gallery orchestration extracted from two demonstrated implementations.
- Responsive shared navigation with secondary collections in a full-viewport `Portfolios` overlay; Home remains available only through its navigation item and the brand link.
- Preserved Home film experience and one real, directly addressable secondary portfolio.
- Lazy secondary route and existing 404 behavior for unknown slugs.
- Regression coverage proving catalog validity, project isolation, route behavior, image loading, lightbox behavior, and unchanged Home presentation.
- Measured production entry, route chunk, image request, and navigation behavior.

## Implementation plan

1. Collect and record the first secondary project's approved metadata and assets. Reject duplicate IDs, duplicate slugs, slugs longer than 32 characters, missing destinations, unordered photo sets, and missing intrinsic dimensions before changing architecture.
2. Add failing unit tests for unique stable project IDs and routes, valid short slugs, nonempty display metadata, and a distinction between Home and secondary project paths. Keep these tests on public catalog behavior rather than internal file layout.
3. Add a lightweight project-summary module that contains no photographs, generated source sets, JSX, Hooks, or route component imports. Include the current film summary and the supplied secondary summary.
4. Separate `Photo`, photo metadata validation, and catalog construction from the film-specific metadata and Vite glob calls. Keep each project's image glob literal and constrained to its own asset directory so Vite can build deterministic responsive variants without sweeping unrelated photography.
5. Move the current film implementation into explicit project ownership while preserving its eager `/` route, photo order, IDs, hero timing, editorial composition, statement links, lightbox behavior, and generated media output. Use Git-aware moves for large photographs and avoid recompressing editing sources.
6. Add the secondary project's source photographs under its own descriptive asset directory and create its own metadata and literal source-generation module. Preserve original editing files in Git only according to the existing architecture; browsers receive generated responsive variants.
7. Extract a shared portfolio experience only after comparing the two real routes. It may own hero, grid, lightbox state, scroll lock, preload behavior, and cleanup. Give route components an explicit child or render boundary for optional editorial content instead of a universal section configuration object.
8. Keep the film route's existing `PortfolioScrollComposition` and portfolio-document closing section project-specific. Compose the secondary project from the shared experience plus only its approved editorial sections.
9. Add the secondary route as a lazy module under `/portfolio/:slug`. Keep Home eager, preserve route focus and scroll policy, and resolve unknown slugs to the existing `NotFound` experience without redirects or silent fallback to another project.
10. Add focused component and route coverage for both projects, direct URLs, browser back and forward, repeated navigation, project-specific content isolation, lightbox opening and dismissal, reduced motion, and missing slugs.
11. Build production and confirm that loading `/` does not request the secondary route chunk or its images, visiting the secondary URL does not fetch unrelated project photographs, and responsive image generation remains bounded per project.
12. Run focused lint, formatting, type, unit, and component checks. Review Home and the secondary project in a real browser at representative mobile and desktop viewports before asking the user to approve composition and media behavior.
13. After visual approval, run production E2E and the full release checks. Record bundle changes, generated media totals, project content decisions, and the PR link.

## Acceptance criteria

- `/` remains the current film portfolio with its approved hero, editorial composition, photo order, statement/resume closing section, and footer transition.
- One supplied real project is reachable at an approved `/portfolio/:slug` path whose slug is unique and no longer than 32 characters.
- Project destination and optional date remain lightweight metadata and are not structurally required in the URL. Current secondary project pages deliberately omit the destination label from their visual title treatment.
- Lightweight project summaries can render links without importing photo catalogs, project route components, or original photographs.
- Film and secondary project photo discovery is isolated to their own literal asset paths, with complete unique IDs, alt text, intrinsic dimensions, responsive source sets, and stable order.
- Both projects reuse responsive hero, grid, lightbox, navigation, preload, and cleanup behavior without duplicating that orchestration.
- Viewports at or above the measured 480 px collision boundary show `Home`, `Contact`, and `Portfolios`; narrower viewports collapse those destinations into a right-aligned geometric hamburger panel, and the portfolio overlay excludes Home. Opening `Portfolios` fills the viewport behind the persistent navigation with centered secondary-project labels occupying 80% of its width in uppercase Zen Tokyo Zoo with a legible text shadow. Hover or keyboard focus reveals an approved responsive cover from the center outward; compact viewports select the approved portrait crop and navigate on one tap. Escape, the navbar close control, and click-away dismissal reverse the overlay motion. Selecting a project navigates immediately, hides the primary navigation until the next pointer movement or scroll, and retains its cover while the dark scrim and labels collapse inward; the cover then dissolves into the destination without changing its full-viewport geometry. Selecting the already-active project restarts its hero on the matching cover with a fresh rotation interval. Reduced motion makes the exit immediate.
- Lightbox numbering remains specific to Home; secondary project lightboxes omit it.
- Secondary projects place a static footer-height purple panel between the hero and photo grid, separated from the hero by a canvas-black rule and containing only the optically centered uppercase project title in Zen Tokyo Zoo at the portfolio selector's responsive type scale.
- Portrait cards span two responsive grid tracks so the next landscape photograph fills the available neighboring cell while catalog order remains row-major.
- The stable lightbox stage reserves enough top clearance that no photograph overlaps the close control.
- Secondary project footers show the résumé centered at roomy widths and right-aligned at compact widths without duplicating portfolio discovery links.
- The film-specific Entropy/Chaos composition and statement/resume links do not appear on another project unless explicitly added there.
- A secondary project can omit editorial sections or supply a different composition without changing the shared gallery implementation.
- Home does not request a secondary route chunk or secondary-project images before navigation; secondary routes do not request unrelated project images.
- Direct URLs, browser history, route focus, scroll restoration, keyboard use, mobile behavior, and reduced motion remain correct.
- Unknown or unavailable slugs render the existing accessible 404.
- No generic page-builder schema, backend, runtime image service, or new dependency is introduced.

## Verification

Before visual approval:

- Focused Vitest project-summary, photo-catalog, navigation, and presentation-policy tests.
- Focused Cypress component tests for the shared gallery and each concrete project composition.
- `npm run lint`
- `npm run format:check`
- `npm run typecheck`
- `npm run build`
- Production build inspection for entry and per-project route chunks, generated media sets, and duplicate assets.
- Browser Network review proving route and image isolation on direct and client-side navigation.
- Manual Home and secondary-project review on mobile and desktop, with keyboard and reduced motion.

After the user approves both project experiences and requests no further visual edits:

- `npm run test:e2e`
- `npm run check`
- `npm run security:audit`

## Risks and recovery

| Risk                                               | Mitigation or recovery                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Architecture is generalized from one project       | Require a second real project before extraction and share only behavior demonstrated by both.                |
| All project media enters the Home dependency graph | Separate lightweight summaries from lazy project content and verify requests in a production trace.          |
| Literal Vite globs become broad or ambiguous       | Give every project a bounded asset directory and a project-owned literal glob with fail-fast metadata tests. |
| Shared gallery constrains editorial design         | Keep editorial composition project-owned through an explicit composition boundary.                           |
| Project URLs become long or unstable               | Use unique two-to-four-word slugs capped at 32 characters and keep destination/date outside the path.        |
| Moving large files creates an unreadable diff      | Use Git-aware moves, preserve source bytes, and review generated build output rather than committing it.     |
| Root portfolio changes during extraction           | Protect current Home content, ordering, interaction, geometry, and network behavior before refactoring.      |

## Definition of done

- The current film project and one real secondary project satisfy every catalog, route, composition, accessibility, and loading criterion.
- Shared code reflects demonstrated behavior from both projects and does not encode project-specific layout or copy.
- Focused checks pass before visual review, the user approves both routes, and final E2E and release checks pass afterward.
- Home and secondary network traces demonstrate project media isolation.
- Architecture documentation reflects the implemented project ownership and route convention.
- The final diff contains only project modeling, one real project migration/addition, justified shared code, tests, assets, and documentation.
- The implementation record and plan index include supplied content decisions, measurements, verification evidence, and the PR link.

## Implementation record

Implementation started on 2026-10-01 from clean, current `main` at `48c2067`.

Supplied secondary projects:

- `paris-fr` — country `france`, city/title `paris`; three finished JPEGs from `/Users/avidixit/Documents/photography/india_2024_finished_photos`: hand holding flowers, hanging shoes, and merry-go-round horse. Filename order is the initial implementation sequence; the first image is the initial hero.
- `kerala` — country `india`, region/title `kerala`; three finished JPEGs from the same source folder: Kochi port/ocean/sky, a person before a field in Alleppey, and a palm tree in Alleppey. The approved port photograph is the initial hero and first grid image.
- `nature` — thematic collection/title `nature`, with no invented geographic destination; six retained landscape JPEGs after removing the second duck photograph during visual review. `leaves-and-clouds-1` is both the initial photograph and the approved landscape/compact cover.

Later supplied additions append Sacré-Cœur Basilica to `paris-fr` and an airplane centered against blue sky to `kerala` without changing either project's approved cover or opening order.

Alt text is derived from the supplied descriptive filenames. Neither project has an approved date label or editorial copy, so neither is included. At completion, record extraction decisions, route and bundle measurements, visual approval, checks, remaining limitations, and PR link.

Implementation to date:

- Extracted the shared `Photo` contract and catalog builder; the film, `paris-fr`, and `kerala` catalogs each retain a bounded, literal project asset glob.
- Kept the film composition eager at `/`; `PortfolioProjectRoute` lazily imports only the visited secondary project's gallery module. The 2026-10-01 production build produced 0.87 kB gzip chunks for each project view, while the Home entry did not contain either project's image identifiers.
- Passed `npm run test:unit` (20 files, 50 tests), `npm run typecheck`, `npm run lint`, `npm run format:check`, `git diff --check`, `npm run build`, and focused Chrome Cypress coverage for direct project routes (6 tests).
- Manually reviewed direct `/portfolio/paris-fr` and `/portfolio/kerala` production-preview URLs, including opening Kerala's shared lightbox. Both rendered their lower-case country/location hierarchy and three ordered supplied images.
- Incorporated the first visual-review corrections: country above city/region, context-aware links to the other portfolios in the shared footer, the Home portfolio navigation visibility policy on every portfolio route, and outgoing-frame dimensions preserved across landscape-to-portrait lightbox navigation.
- Rechecked the production preview in desktop and compact Chrome viewports. Focused component coverage proves the 390×844 footer stack remains right-aligned and non-overlapping, and the portrait handoff retains its landscape predecessor until the replacement settles.
- Replaced the temporary footer collection links with one shared responsive navigation menu after user review: desktop keeps destinations visible and places secondary collections in a right-edge `Portfolios` dropdown; compact viewports use a hamburger with the same order and nested collection list. Home is deliberately absent from that submenu.
- Refined both responsive disclosures into controlled Motion panels: they size from the longest label plus one padding value, use `#4A4A4A`, preserve the navigation separator above canvas-black outer edges, stagger right-aligned portfolio links, share selection/Escape/click-away dismissal, pause navigation auto-hide while open, and remove animation under reduced motion. The desktop panel is centered beneath its disclosure label, and project routing begins only after its 450 ms exit finishes.
- After approving that checkpoint, replaced the compact portfolio panels with one shared full-viewport overlay behind the persistent navbar. Its lightweight summaries contain only cover-photo IDs; opening the overlay lazily imports each secondary catalog for the current viewport orientation, while hover or focus reveals the selected responsive cover from the center outward. Paris uses hand-held flowers/hanging shoes for landscape/portrait, and Kerala uses Kochi port/a cropped palm-tree sunset. Home remains excluded and compact navigation remains one tap.
- Centered the full-overlay labels, retained the primary navigation until its measured 480 px collision boundary, and restyled the compact disclosure with the site canvas and border tokens plus a clipped geometric silhouette. The compact disclosure now completes its exit before the portfolio overlay opens. Project selection navigates immediately, retains its selected cover, and collapses only the dark scrim and shadowed labels inward before dissolving into the destination. This removes the redundant shutter state machine and its stuck-black failure mode; reduced motion remains immediate.
- Passed the 17-test focused Chrome navigation component spec plus typecheck, lint, formatting, production build, and diff checks. Production-preview inspection verified both responsive navigation states, the compact-to-overlay sequence, centered project labels, immediate project routing, retained selected covers, and the inward overlay exit.
- Removed the 64 px handoff jump by giving the retained cover the destination hero's exact full-viewport box. Production-preview measurements confirmed both are 1512 × 806 at origin (0, 0) for Paris and Kerala. Reordered Kerala to open on its approved Kochi port cover and protected that first-photo contract with a focused catalog test.
- Made project landings start with the existing navigation hidden state for a more immersive hero; the established pointer/scroll listeners reveal it without another state machine. Increased the overlay-label shadow in place and protected both behaviors in the focused navigation component spec.
- Keyed each secondary hero to React Router's existing location identity, so reselecting the active project natively remounts its slideshow and interval. Focused Chrome coverage and a production-preview Paris → menu → Paris run confirmed the cover remains for the full fresh 2.5-second interval before rotating.
- Kept Home lightbox numbering opt-in, omitted numbering from secondary projects, added the résumé to secondary footers, and protected both landscape-to-portrait and portrait-to-landscape handoffs with the shared lightbox implementation and focused component coverage while retaining the approved 200 ms handoff timing.
- Replaced the secondary pages' country/city heading with a shared static purple title panel between the hero and grid containing only the uppercase project name in Zen Tokyo Zoo at the portfolio selector's responsive type scale. Kept destination values as non-rendered lightweight metadata for later discovery work.
- Kept the catalog's row-major order while allowing portrait cards to span two responsive grid tracks, so subsequent landscapes fill the otherwise empty neighboring cell. Reserved five rem of vertical lightbox stage space so photographs remain below the close control at short desktop heights.
- Removed Nature's second duck photograph during visual review. Removed the lightbox's opening container fade so its existing clicked-source preview no longer double-exposes over the underlying grid, then fixed the remaining same-paint source race by requiring one painted preview frame before the decoded image begins its existing blend. The close animation remains unchanged.
- Promoted a hovered or keyboard-focused grid photograph to the existing lightbox `sizes` and fetch-priority policy in place, allowing the browser to warm the exact responsive format and candidate before a first open without adding another cache or preload implementation.
- Repaired PR #57's first CI run at the shared causes: moved reusable project photo details into project-owned modules, replaced three complete runtime catalog imports with one lazy cover-only catalog, added focused cover-loader coverage, made navigation animation assertions observe completion with a small timing cushion, and updated the 390 px E2E journey to open the approved hamburger before asserting Contact. Local verification passed the 61-test coverage gate, the 17-test Navigation Chrome component spec, lint, formatting, typecheck, production build, and all 13 production E2E tests.

User visual approval is complete. PR #57 is awaiting the authoritative GitHub Actions gate and final review.
