# 019 — Add the portfolio discovery index

| Field          | Value                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| Type           | Feature                                                                                      |
| Status         | Tracked in the [plan index](README.md)                                                       |
| Depends on     | [018 — Portfolio collection models and routes](018-portfolio-collection-model-and-routes.md) |
| Blocks         | None                                                                                         |
| Planned branch | `feat/portfolio-discovery-index`                                                             |
| PR base        | `main`                                                                                       |
| PR             | Not opened                                                                                   |

## Outcome

Every portfolio ends with a restrained, destination-grouped index that lets visitors continue through the body of work without covering photographs or expanding primary navigation. The index uses Inter typography, clear current-project context, the established underline language, and subtle entrance motion. It contains no thumbnails or eager media and remains part of each portfolio's closing content rather than the global copyright footer.

## Prerequisites and current state

- Complete Plan 018 with at least two real portfolio summaries and routes. This ticket must consume its lightweight summary catalog rather than define a parallel list of projects.
- Home remains the film portfolio at `/`; other projects use short `/portfolio/:slug` paths. Destination is display and grouping metadata.
- Plan 017 adds Home-only Artist Statement and Résumé links above the shared footer. Plan 019 may compose those links within the broader Home closing region, but they remain absent from other portfolios.
- The shared fixed footer remains responsible only for the decorative signature, copyright, parallax, and final landing behavior. It must not read the current route or receive project data.
- The approved discovery direction is text-only. Do not preload photographs, generate hover thumbnails, or add an image-preview layer in the first version.
- The index appears at the end of every portfolio. It displays every currently available project, including the current project as noninteractive text with `aria-current="page"` or equivalent semantic state.
- Projects are grouped into responsive columns by destination. Catalog order remains curated; do not add a second ordering configuration solely for the index.

## Scope

- Add one portfolio-owned discovery component that receives the lightweight available-project summaries and current project ID through explicit inputs.
- Group projects by destination while preserving the catalog's destination and project order.
- Render a semantic project-navigation region at the end of every portfolio after its photographs and project-specific editorial content.
- Show the current project in the same structure without linking it to itself or replaying its route.
- Render other available projects as React Router links with project title, concise optional date, and destination context.
- Use the established Inter font and a CSS-driven underline interaction consistent with the primary navigation without copying its indicator implementation.
- Add one bounded viewport entrance using the installed Motion runtime: opacity and a small vertical offset with restrained stagger where it remains legible.
- Render the final state immediately for reduced-motion users and avoid scroll-linked or continuous animation.
- Integrate Home's portfolio-document links into the closing composition without placing them on secondary project pages.
- Respect feature availability by receiving an already filtered project list; the discovery component must not decide release policy.
- Add grouping, semantics, navigation, responsive layout, reduced-motion, and cross-project journey coverage.

Anticipated ownership includes `src/features/portfolio/`, the lightweight summary data established by Plan 018, existing Motion presentation policy only if a reusable timing already fits, and focused unit, component, and E2E coverage. The global `Footer.tsx`, primary `Navigation.tsx`, and image catalogs should not need discovery-specific behavior.

## Non-goals

- Do not add a navigation dropdown, mega menu, carousel, thumbnail strip, background image, hover preview, video, or pointer-following effect.
- Do not add image requests, prefetch every project route, or preload another project's media on index visibility.
- Do not change the Home URL, project route convention, project metadata source, or feature-availability policy.
- Do not add search, filters, tags, pagination, project descriptions, CMS data, or backend integration.
- Do not intercept scrolling, extend the footer landing controller, or add another animation package.
- Do not link the current project to itself, hide it from its destination group, or rely on color alone to identify it.
- Do not add Artist Statement or Résumé links to secondary portfolios.
- Do not implement image previews without a separate measured plan and explicit mobile behavior.

## Deliverables

- Destination-grouped, text-only project index on every portfolio.
- Clear noninteractive current-project state and accessible links to every other available project.
- Home closing composition that retains its statement and résumé links without changing the global footer.
- Restrained entrance motion and immediate reduced-motion equivalent.
- Deterministic grouping logic and regression coverage.
- Browser and production evidence for responsive layout, keyboard behavior, route transitions, and absence of added media requests.

## Implementation plan

1. Add failing unit tests for destination grouping, catalog-order preservation, current-project lookup, and empty or missing-current inputs. Keep grouping pure and local to portfolio discovery rather than adding a general collection utility.
2. Add failing component coverage for semantic navigation, destination headings, complete available-project names, current-project non-link state, route links, optional date rendering, keyboard focus, and absence of image elements.
3. Implement the smallest portfolio-owned discovery component with explicit `projects` and `currentProjectId` inputs. Fail clearly in development or render a safe result when the current ID is absent according to the tested policy; do not silently mark another project current.
4. Group summaries by destination using their existing catalog order. Use responsive CSS grid columns that collapse naturally on narrow viewports and do not introduce horizontal document overflow.
5. Render the current project as text with a visible “Current” label and `aria-current="page"`. Render every other available project as a router link. Use title and optional date as concise content; do not repeat destination inside every row when its group heading already supplies it.
6. Implement the underline with local CSS or Tailwind pseudo-element utilities using the established vivid-violet token and visible keyboard focus. Keep pointer hover, keyboard focus, and touch activation equivalent in meaning.
7. Add one section-level Motion reveal using the existing feature set. Limit it to opacity and a small transform, use a short fixed stagger only across rendered groups or links, run once when the section becomes visible, and render final values immediately under reduced motion.
8. Place discovery after each project's gallery and project-owned editorial content and before the shared footer reveal. On Home, compose the Plan 017 portfolio-document links in the same closing region or immediately adjacent section without duplicating them or exposing them elsewhere.
9. Filter unreleased projects before passing summaries into discovery using Plan 016's application availability decision. Test the component independently with explicit lists so hidden features remain covered without appearing in production.
10. Add E2E coverage for moving from Home to a secondary portfolio, seeing the new current marker, navigating to another project, returning through browser history, and using the Home wordmark. Verify route focus and scroll reset remain governed by the existing boundary.
11. Build production and confirm that revealing or interacting with the index adds no image requests, eagerly loaded project media, new runtime dependency, or unexpected route prefetch. Record the JavaScript and CSS delta.
12. Run focused lint, formatting, type, unit, and component checks. Review the closing index on representative mobile and desktop viewports with keyboard, touch-sized targets, normal motion, and reduced motion.
13. Ask the user to approve typography, grouping, column rhythm, current-state treatment, underline behavior, and reveal timing. After approval, run production E2E and the full release checks and record evidence.

## Acceptance criteria

- Every available portfolio ends with the same semantic project index before the shared footer reveal.
- Projects are grouped by destination into responsive Inter-set columns and retain the curated catalog order.
- Every available project appears exactly once.
- The current project remains visible, is clearly labeled without relying only on color, carries semantic current-page state, and is not an interactive self-link.
- Every other project uses its short canonical route and receives visible hover and keyboard-focus underline feedback.
- The index does not overlap photography, primary navigation, project-specific editorial content, or the global footer.
- Home retains Artist Statement and Résumé links in its closing region; secondary projects do not receive them.
- The entrance uses only bounded transform and opacity with restrained timing. Reduced-motion users receive the complete static index immediately.
- Mobile layout has no horizontal overflow, clipped text, pointer-only information, or targets smaller than the established accessible controls.
- Navigating between projects preserves existing route focus, scroll reset, history, loading fallback, and wordmark behavior.
- Unreleased projects are absent from the production index while their component and route behavior remain testable.
- Rendering and revealing the index causes no photo, thumbnail, video, or unrelated project-media request.
- No dropdown, global footer route logic, new dependency, or general animation framework is introduced.

## Verification

Before visual approval:

- Focused Vitest grouping and current-project policy tests.
- Focused Cypress component tests for semantics, destination columns, links, current state, Home documents, responsive layout, and reduced motion.
- `npm run lint`
- `npm run format:check`
- `npm run typecheck`
- `npm run build`
- Browser Network review confirming no media request is initiated by the index.
- Manual review on Home and secondary projects at mobile, tablet, and desktop widths with keyboard, touch, normal motion, and reduced motion.

After the user approves the output and requests no further visual edits:

- `npm run test:e2e`
- `npm run check`
- `npm run security:audit`

## Risks and recovery

| Risk                                           | Mitigation or recovery                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Index becomes another global navigation system | Keep it portfolio-owned, end-of-page, and based on the single lightweight project summary catalog.            |
| Destination groups become uneven on mobile     | Use natural grid flow and content-driven height; avoid fixed row counts, horizontal scrolling, or masonry.    |
| Motion delays access to links                  | Animate presentation only, keep semantics available, bound timing, and render immediately for reduced motion. |
| Current project behaves like a broken link     | Use noninteractive text, explicit current labeling, and semantic current-page state.                          |
| Discovery triggers media downloads             | Keep summaries image-free and verify production network requests before approval.                             |
| Home document links leak to other projects     | Keep them as a Home-specific composition input and protect absence on secondary routes.                       |
| Future preview ideas complicate this baseline  | Require a separate performance-measured plan instead of reserving thumbnail or hover-preview machinery now.   |

## Definition of done

- The index satisfies grouping, current-state, navigation, accessibility, responsive, motion, and network acceptance criteria on every implemented project.
- Home retains its project-specific documents and the global footer remains route-agnostic and copyright-only.
- Focused checks pass before visual review, the user approves the index, and final E2E and release checks pass afterward.
- Production evidence confirms no added media requests and records the bounded JavaScript/CSS delta.
- The final diff contains only portfolio discovery, its integration, tests, and necessary documentation.
- The implementation record and plan index include final design decisions, visual approval, verification evidence, and the PR link.

## Implementation record

Not started. On implementation, record the final destination groups and order, current-state wording, Home closing composition, motion values, bundle delta, network evidence, visual approval, checks, limitations, and PR link.
