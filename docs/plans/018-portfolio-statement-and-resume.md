# 018 — Add the portfolio statement and résumé

| Field          | Value                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| Type           | Feature                                                                                      |
| Status         | Tracked in the [plan index](README.md)                                                       |
| Depends on     | [017 — Feature availability controls](017-feature-availability-controls.md)                  |
| Blocks         | [019 — Portfolio collection models and routes](019-portfolio-collection-model-and-routes.md) |
| Planned branch | `feat/portfolio-statement-resume`                                                            |
| PR base        | `main`                                                                                       |
| PR             | Not opened                                                                                   |

## Outcome

The current body of work ends with two restrained, Home-only links to its accompanying artist statement and Avi Dixit's résumé. The complete statement is readable as a first-class HTML page at `/artist-statement`; the résumé remains a lightweight PDF opened on demand. Shop, Contact, and the shared copyright footer do not inherit these links.

## Prerequisites and current state

- Complete Plan 017 first so route visibility and navigation composition have settled before adding another route.
- `Portfolio.tsx` currently ends with the photo grid inside the opaque Home surface, followed by the application-wide fixed footer. `Footer.tsx` intentionally contains only the decorative signature and copyright.
- The artist statement accompanies the displayed body of work. It is not an “About the artist” biography and must not be labeled or framed as one.
- The approved placement is a Home-owned final section immediately after the photo grid and before the shared footer reveal. It may visually complement the footer, but it remains part of the portfolio feature and normal document flow.
- The approved source statement is recorded in this ticket under “Approved statement copy.” Preserve its wording and emphasis unless the user approves editorial changes. Typographic paragraph breaks may improve reading without changing the prose.
- The approved résumé source is `/Users/avidixit/Documents/Personal/Avi_Dixit_Resume.pdf`. It was verified on 2026-09-12 as a valid one-page PDF 1.3 file of 87,909 bytes. The user has selected it for public website distribution.
- The statement page is intentionally absent from the primary Home, Shop, and Contact navigation. It is reached from the portfolio closing section and remains compatible with the existing Home wordmark navigation.

## Scope

- Add a concise final Home section labeled for portfolio documents, with `Artist Statement` and `Résumé (PDF)` links set in the established Inter treatment.
- Keep the section inside the portfolio feature so it renders only on Home and does not make the global footer route-aware.
- Add `/artist-statement` as a lightweight secondary route using the existing route-transition, focus, scroll, fallback, and reduced-motion policies.
- Present the complete approved statement as accessible HTML with readable line length, paragraph rhythm, semantic heading hierarchy, and preserved emphasis.
- Copy the approved résumé into a focused repository asset location with a normalized filename. Import it through Vite so the production file receives content-hashed cache invalidation and is not fetched until selected.
- Open the résumé in a new browser tab with its format disclosed in the link text and safe external browsing attributes.
- Add focused coverage for route reachability, Home-only placement, exact approved content anchors, PDF integrity, keyboard use, and the absence of an eager PDF request.
- Keep the closing section structurally simple enough for later portfolio-discovery links to extend through a separately approved plan.

Anticipated ownership includes `src/features/portfolio/`, `src/features/portfolio/resources/` only if structured link data proves useful, `src/assets/documents/`, `src/resources/navigation.ts`, `src/app/RouteTransitionBoundary.tsx`, and affected component and E2E coverage. The application-wide footer should require no content or routing changes.

## Non-goals

- Do not add an About page, biography, portrait, résumé parser, content-management system, or backend.
- Do not render the full statement inline on Home, in a modal, accordion, or global footer.
- Do not add Artist Statement or Résumé to the primary navigation, Shop, Contact, or their footer experience.
- Do not change the shared footer's signature, copyright, height, parallax, or landing behavior.
- Do not edit, regenerate, compress, or extract content from the supplied résumé PDF unless a verified browser problem requires a separate decision.
- Do not add a PDF viewer dependency, eagerly load the PDF, or embed it in an iframe.
- Do not build the future city or destination portfolio selector in this ticket.

## Deliverables

- Home-only portfolio-document closing section.
- Accessible `/artist-statement` HTML route containing the approved statement.
- Repository-owned, content-hashed résumé PDF link sourced from the approved file.
- Route, content, placement, asset-integrity, and network-behavior regression coverage.
- Responsive and reduced-motion browser review.
- Updated architecture current state if implementation establishes a lasting route or document-asset convention.

## Implementation plan

1. Add failing component coverage for a final portfolio-document section containing only the approved statement and résumé links, with correct destinations, disclosed PDF format, keyboard focus, and no dependency on the global footer.
2. Add the smallest coherent portfolio-owned component for the closing links and render it after `PhotoGrid` in `Portfolio.tsx`. Keep its copy local or in a feature resource according to the established static-resource rules; do not introduce a generic footer-slot API.
3. Style the section as a restrained continuation of the body of work using current semantic tokens, Inter link typography, visible focus, and the existing underline language. Keep it readable from narrow mobile through wide desktop without increasing the global footer height.
4. Copy the supplied résumé to `src/assets/documents/avi-dixit-resume.pdf`, import its resolved URL from the owning portfolio component, and link to it with `target="_blank"`, `rel="noopener"`, and `Résumé (PDF)` as the visible name.
5. Add a focused asset test that verifies the committed file begins with the PDF signature and remains within a conservative 250 KB ceiling. Do not assert its exact hash or byte count.
6. Add the `/artist-statement` route constant and lazy secondary route. Preserve the existing route frame, Suspense fallback, focus placement, navigation history, and return-to-Home behavior without adding a primary navigation item.
7. Implement the statement page with one semantic `main`, one `h1`, readable paragraph grouping, a bounded reading column, Inter body copy, and Zina only where it serves the established display hierarchy. Preserve the emphasized word _single_ and do not rewrite the approved prose.
8. Add component and route coverage for the title, representative opening and closing sentences, semantic structure, direct-route loading, browser back behavior, and absence of statement links on Shop and Contact.
9. Confirm in a production browser trace that the résumé is absent from initial Home and statement-page network requests and downloads only after activation. Record the emitted PDF size and route chunk delta.
10. Run focused lint, formatting, type, unit, and component checks. Review the closing section and statement route on representative mobile and desktop sizes, with keyboard navigation and reduced motion.
11. Ask the user to approve the section label, composition, statement typography, and route transition. After approval, run production E2E and the full release checks and record evidence.

## Acceptance criteria

- Home displays a restrained portfolio-document section after the photo grid and before the shared footer reveal.
- The section is described as accompanying the portfolio or body of work and never as “About the artist.”
- Shop and Contact do not display the statement or résumé links, and `Footer.tsx` remains copyright-only.
- `Artist Statement` navigates to `/artist-statement` through the existing accessible route transition.
- The statement route renders the complete approved prose as HTML with semantic headings, readable line length, responsive spacing, and preserved _single_ emphasis.
- The statement route is not added to primary navigation and remains reachable by direct URL, browser history, and the Home closing link.
- `Résumé (PDF)` resolves to the approved one-page file, opens in a new tab, and does not require a runtime PDF library.
- The PDF is emitted as a separate content-hashed asset and is not downloaded during ordinary Home, Shop, Contact, or statement-page loading.
- The closing section and statement remain keyboard accessible, visibly focused, and comfortable on mobile; reduced motion does not remove access to any content.
- The implementation adds no route-aware global footer logic, runtime service, or new dependency.

## Verification

Before visual approval:

- Focused Vitest PDF integrity and approved-resource tests.
- Focused Cypress component tests for the portfolio closing section and statement page.
- `npm run lint`
- `npm run format:check`
- `npm run typecheck`
- `npm run build`
- Browser Network review confirming the PDF is requested only after selection.
- Manual Home, Shop, Contact, direct statement-route, browser-history, keyboard, mobile, desktop, and reduced-motion review.

After the user approves the output and requests no further visual edits:

- `npm run test:e2e`
- `npm run check`
- `npm run security:audit`

## Risks and recovery

| Risk                                           | Mitigation or recovery                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Portfolio material is mistaken for biography   | Use functional portfolio-document language and preserve the supplied statement as work-specific prose.        |
| Global footer becomes route-aware              | Keep links in the Home feature's normal flow immediately above the unchanged shared footer.                   |
| Long prose becomes visually overwhelming       | Use a separate route, readable measure, deliberate paragraph breaks, and restrained display typography.       |
| Résumé is fetched with the initial application | Emit it as a separate imported asset and verify requests in a production browser trace.                       |
| PDF becomes stale after future replacement     | Rely on Vite content hashing and deployment rather than a permanent public filename with ambiguous caching.   |
| Later portfolio links force premature design   | Leave an ordinary feature-owned section that a later scoped plan can extend without a generic slot framework. |

## Definition of done

- The statement route, Home-only links, résumé delivery, semantics, accessibility, and network behavior satisfy every acceptance criterion.
- The exact approved statement remains intact and the selected résumé is committed without modification.
- Focused checks pass before browser approval, the user approves the visible result, and final E2E and release checks pass afterward.
- The shared footer remains unchanged in responsibility and content.
- The final diff contains only portfolio documents, their route and assets, regression coverage, and necessary documentation.
- The implementation record and plan index include final verification evidence and the PR link.

## Approved statement copy

Use the following statement for the HTML route. Preserve its words and the emphasis on _single_ unless the user explicitly approves copy editing:

> Entropy. Chaos. The second law of thermodynamics stands as a principal tenet to the fabric of our universe: the disorder of particles continually increases with each passing second. And when I looked back at my combined body of work, that’s all I could see: mayhem. Yet, within the chaos of my work, much like the universe, there is a beauty that cannot be described. Every family member, every friend, every love, every enemy, and every historical figure who has come and gone lived on this _single_ planet among an inconceivable number of other possibilities. How? How did the Earth hit the lottery millions of times over? How can I go outside and find so many marvelings of nature juxtaposed with the horrors of human intervention? Was I placed here through sheer coincidence or predestination? When I was tasked with providing words for my work, I could not find any. I was met with more chaos. Static. I felt it was easier to show a glimpse into how my mind works. Each photo is arranged in chronological order from the day they were taken. You can see my progression as I come up with new ideas and experiments. You can see how one successful scheme bleeds into the next. You can see my progression from the inside to the outdoors in both a figurative and literal sense. These photos are jarring, disorienting, and perplexing, yet these photos hold an undeniable majesty to them. The sun manages to sparkle through the paper, bouncing off water droplets stuck in an endless freefall. The jagged, sharp geometry both tears through the scenes and adds a contained order to each photo. How can I describe my photos? I describe them as the universe from whence they came—a relentless whirlwind of possibilities that happened to align perfectly, resulting in something delightful and endlessly intriguing. And I find myself attempting to establish where I fit into this mess at the center of it all.

## Implementation record

Not started. On implementation, record the final section label and composition, statement paragraph structure, PDF provenance and emitted size, network evidence, route behavior, visual approval, commands, limitations, and PR link.
