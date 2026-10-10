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
- Shared `Lightbox.tsx`: allow the first navigation while the opening image upgrades; retain the source actually visible as the outgoing layer. Warm one neighbor in each direction initially, expanding to the existing bounded window after the selected image settles.
- `PortfolioMenu.tsx`: start background cover warming after page load, one cover at a time, capped at the first four projects. Later projects retain intent loading; orientation changes restart staged warming.
- Subset the OFL-licensed Inter file to Latin, Latin Extended-A/B, general punctuation, euro and trademark. Keep Zina unmodified because its license forbids derivatives.
- Protect behavior with component tests and update enduring architecture guidance.

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
- The outgoing layer preserves the visible preview in that case; subsequent rapid navigation remains queued safely.
- Two neighboring images preload initially; the existing five-image window is restored after settling.
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
- A fresh native Chrome preview tab showed the intended desktop lightbox geometry and adjacent navigation. Codex-Sandbox's debugger connection was unavailable, so the post-change controlled Slow 4G cold/warm comparison remains pending; no measured interaction speedup is claimed. The user approved the changes before commit.
- Deployed cache behavior remains unverified until deployment. No CI polling or backend implementation is part of this pass.
