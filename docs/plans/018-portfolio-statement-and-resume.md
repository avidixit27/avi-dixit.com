# 018 — Add the portfolio statement and résumé

| Field          | Value                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| Type           | Feature                                                                                      |
| Status         | In progress; tracked in the [plan index](README.md)                                          |
| Depends on     | [017 — Feature availability controls](017-feature-availability-controls.md)                  |
| Blocks         | [019 — Portfolio collection models and routes](019-portfolio-collection-model-and-routes.md) |
| Planned branch | `feat/portfolio-statement-resume`                                                            |
| PR base        | `main`                                                                                       |
| PR             | Not opened                                                                                   |

## Outcome

The Home footer presents smaller, centered Tangerine links to Avi Dixit's artist statement and résumé beside the signature logo. Selecting Artist Statement expands the complete HTML statement after the Home photo grid; `/artist-statement` redirects to that `/#artist-statement` state. The résumé remains a lightweight PDF opened on demand. Shop, Contact, and every non-Home footer omit these links.

## Prerequisites and current state

- Complete Plan 017 first so route visibility and navigation composition have settled before adding another route.
- `Portfolio.tsx` ends with the photo grid inside the opaque Home surface, followed by the application-wide fixed footer.
- The artist statement accompanies the displayed body of work. It is not an “About the artist” biography and must not be labeled or framed as one.
- The approved placement is inside the Home footer beside the decorative signature logo. `Footer.tsx` receives the route decision and omits the links outside Home.
- The approved source statement is recorded in this ticket under “Approved statement copy.” Preserve its wording and emphasis unless the user approves editorial changes. Typographic paragraph breaks may improve reading without changing the prose.
- The approved résumé source is `/Users/avidixit/Documents/Personal/Avi_Dixit_Resume.pdf`. It was verified on 2026-09-12 as a valid one-page PDF 1.3 file of 87,909 bytes. The user has selected it for public website distribution.
- The statement is intentionally absent from primary navigation. It is reached from the Home footer, expands only while the Home hash is `#artist-statement`, and its visible close control returns focus to that footer link.
- The user selected Tangerine for the visible footer links, Zina for the statement title, and Inter for its prose. Use the supplied Tangerine Regular face with its SIL Open Font License; do not alter the approved résumé PDF itself.

## Scope

- Add `Artist Statement` and `Resume` links beside the signature in the Home footer, set in Tangerine.
- Keep the route decision local to `Footer.tsx` so the footer renders the links only on Home.
- Reveal the complete approved statement after the Home photo grid only when the Home hash is `#artist-statement`; expand it from beneath the grid while the viewport follows the drawer to the stable heading boundary, then keep the viewport there as the remaining content opens below. Use a visible close control that waits for the actual return to the panel regardless of scroll distance, pauses, collapses it beneath the portfolio, and restores focus to the footer link without jumping to the page top.
- Redirect the legacy `/artist-statement` URL to `/#artist-statement`.
- Present the complete approved statement as accessible HTML with a Zina heading, Inter prose, readable line length, paragraph rhythm, semantic heading hierarchy, and preserved emphasis.
- Copy the approved résumé into a focused repository asset location with a normalized filename. Import it through Vite so the production file receives content-hashed cache invalidation and is not fetched until selected.
- Open the résumé in a new browser tab with safe external browsing attributes.
- Add focused coverage for route reachability, Home-only placement, exact approved content anchors, PDF integrity, keyboard use, and the absence of an eager PDF request.
- Keep the footer link group structurally simple enough for later portfolio-discovery links to extend through a separately approved plan.

Anticipated ownership includes `src/app/Footer.tsx`, `src/assets/documents/`, `src/resources/navigation.ts`, `src/app/RouteTransitionBoundary.tsx`, and affected component and E2E coverage.

## Non-goals

- Do not add an About page, biography, portrait, résumé parser, content-management system, or backend.
- Do not render the statement before it is selected, in a modal, accordion, or global footer.
- Do not add Artist Statement or Resume to the primary navigation, Shop, or Contact.
- Do not change the shared footer's signature, copyright, height, parallax, or landing behavior beyond the Home-only document links beside the signature.
- Do not edit, regenerate, compress, or extract content from the supplied résumé PDF unless a verified browser problem requires a separate decision.
- Do not add a PDF viewer dependency, eagerly load the PDF, or embed it in an iframe.
- Do not build the future city or destination portfolio selector in this ticket.

## Deliverables

- Home-only portfolio-document links in the footer.
- Hash-controlled Home statement card containing the approved statement, plus legacy-route redirect coverage.
- Repository-owned, content-hashed résumé PDF link sourced from the approved file.
- Route, content, placement, asset-integrity, and network-behavior regression coverage.
- Responsive and reduced-motion browser review.
- Updated architecture current state if implementation establishes a lasting route or document-asset convention.

## Implementation plan

1. Add failing component coverage for Home-only footer links with correct destinations, keyboard focus, and their absence on non-Home routes.
2. Render the smallest coherent document-link group beside the signature in `Footer.tsx`; do not introduce a generic footer-slot API.
3. Style the links using current semantic tokens, Tangerine typography, visible focus, and the existing underline language without increasing the global footer height.
4. Copy the supplied résumé to `src/assets/documents/avi-dixit-resume.pdf`, import its resolved URL from `Footer.tsx`, and link to it with `target="_blank"`, `rel="noopener"`, and `Resume` as the visible name.
5. Add a focused asset test that verifies the committed file begins with the PDF signature and remains within a conservative 250 KB ceiling. Do not assert its exact hash or byte count.
6. Add the `/artist-statement` legacy redirect to `/#artist-statement` without adding a primary navigation item.
7. Implement the hash-controlled statement panel after the photo grid with a Zina heading, Inter prose, readable paragraph grouping, a bounded reading column, and a visible close control that restores focus. Keep the inexpensive panel mounted but clipped, hidden from assistive technology, and non-interactive while closed. Preserve the emphasized word _single_ and do not rewrite the approved prose.
8. Add component and route coverage for the hidden and open panel, title, representative opening and closing sentences, legacy redirect, close behavior, and the absence of footer links on Shop and Contact.
9. Confirm in a production browser trace that the résumé is absent from initial Home and statement-page network requests and downloads only after activation. Record the emitted PDF size and route chunk delta.
10. Run focused lint, formatting, type, unit, and component checks. Review the expanded card and footer on representative mobile and desktop sizes, with keyboard navigation and reduced motion.
11. Ask the user to approve the section label, composition, statement typography, and route transition. After approval, run production E2E and the full release checks and record evidence.

## Acceptance criteria

- Home displays `Artist Statement` and `Resume` beside the signature in its footer.
- The links are not described as “About the artist” or with additional accompanying-copy labels.
- Shop and Contact do not display the statement or résumé links.
- `Artist Statement` opens `/#artist-statement` with a reveal from beneath the grid; reselecting it smoothly returns to the panel heading, while the closed panel is visually and semantically hidden.
- The expanded panel renders the complete approved prose as HTML with a Zina heading, Inter text, readable line length, responsive spacing, and preserved _single_ emphasis.
- `/artist-statement` redirects to the expanded Home state and the card close control returns focus to the footer link.
- `Resume` resolves to the approved one-page file, opens in a new tab, and does not require a runtime PDF library.
- The PDF is emitted as a separate content-hashed asset and is not downloaded during ordinary Home, Shop, Contact, or statement-page loading.
- The footer links and statement remain keyboard accessible, visibly focused, and comfortable on mobile; reduced motion does not remove access to any content.
- The implementation adds no runtime service or new dependency.

## Verification

Before visual approval:

- Focused Vitest PDF integrity and approved-resource tests.
- Focused Cypress component tests for the Home footer links, expanded statement card, and legacy redirect.
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
| Footer links appear outside Home               | Resolve the location inside `Footer.tsx` and test the Home and Contact states.                                |
| Long prose becomes visually overwhelming       | Keep the card opt-in, use a readable measure, deliberate paragraph breaks, and restrained display typography. |
| Résumé is fetched with the initial application | Emit it as a separate imported asset and verify requests in a production browser trace.                       |
| PDF becomes stale after future replacement     | Rely on Vite content hashing and deployment rather than a permanent public filename with ambiguous caching.   |
| Later portfolio links force premature design   | Leave an ordinary footer link group that a later scoped plan can extend without a generic slot framework.     |

## Definition of done

- The hash-controlled statement panel, Home-only links, legacy redirect, résumé delivery, semantics, accessibility, and network behavior satisfy every acceptance criterion.
- The exact approved statement remains intact and the selected résumé is committed without modification.
- Focused checks pass before browser approval, the user approves the visible result, and final E2E and release checks pass afterward.
- The shared footer contains the document links only on Home and remains unchanged on other routes.
- The final diff contains only portfolio documents, their route and assets, regression coverage, and necessary documentation.
- The implementation record and plan index include final verification evidence and the PR link.

## Approved statement copy

Use the following statement for the HTML route. Preserve its words and the emphasis on _single_ unless the user explicitly approves copy editing:

> Entropy. Chaos. The second law of thermodynamics stands as a principal tenet to the fabric of our universe: the disorder of particles continually increases with each passing second. And when I looked back at my combined body of work, that’s all I could see: mayhem. Yet, within the chaos of my work, much like the universe, there is a beauty that cannot be described. Every family member, every friend, every love, every enemy, and every historical figure who has come and gone lived on this _single_ planet among an inconceivable number of other possibilities. How? How did the Earth hit the lottery millions of times over? How can I go outside and find so many marvelings of nature juxtaposed with the horrors of human intervention? Was I placed here through sheer coincidence or predestination? When I was tasked with providing words for my work, I could not find any. I was met with more chaos. Static. I felt it was easier to show a glimpse into how my mind works. Each photo is arranged in chronological order from the day they were taken. You can see my progression as I come up with new ideas and experiments. You can see how one successful scheme bleeds into the next. You can see my progression from the inside to the outdoors in both a figurative and literal sense. These photos are jarring, disorienting, and perplexing, yet these photos hold an undeniable majesty to them. The sun manages to sparkle through the paper, bouncing off water droplets stuck in an endless freefall. The jagged, sharp geometry both tears through the scenes and adds a contained order to each photo. How can I describe my photos? I describe them as the universe from whence they came—a relentless whirlwind of possibilities that happened to align perfectly, resulting in something delightful and endlessly intriguing. And I find myself attempting to establish where I fit into this mess at the center of it all.

## Implementation record

Implementation began on 2026-09-15 from merged `main` in `feat/portfolio-statement-resume`. The user revised the approved composition: small `Artist Statement` and `Resume` links appear horizontally in the centered Home footer, without an accompanying-copy label or `(PDF)` suffix; the footer omits them on every other route. Artist Statement reveals an opt-in panel after the photo grid; its single-line Zina title sits above Inter prose. The inexpensive panel stays mounted but is clipped, semantically hidden, and non-interactive while closed. Opening animates the clipped panel from zero height while the viewport follows its leading edge, then stops at the stable heading boundary while the remaining content continues expanding below. Chrome timing traces verified monotonic movement from the footer to that boundary and the same final position as reselecting the already-open footer link. Close waits for the browser's completed smooth return regardless of distance, pauses briefly, and then recedes beneath the portfolio without invoking route-level scroll resets; reselecting the already-open footer link smoothly returns to the same boundary. The legacy `/artist-statement` URL redirects to that hash state and the visible close control restores focus to the footer link without scrolling. Tangerine Regular applies to the footer links. Its OFL license is committed beside the font. The original 58 kB TTF was converted to a 24 kB WOFF2 and removed from the repository; its optional loading no longer delays the bootstrap overlay, which previously waited for every document font on a hard refresh. The approved résumé was copied unchanged from `/Users/avidixit/Documents/Personal/Avi_Dixit_Resume.pdf` to `src/assets/documents/avi-dixit-resume.pdf` (PDF 1.3, one page, 87,909 bytes, source SHA-1 `78f3f51e40b4ffc80821c687d084761a0dbb0904`). Record final focused checks, production asset size, browser network evidence, visual approval, and PR link before completion.
