# 001 — Code cleanup

| Field | Value |
| --- | --- |
| Type | Refactor |
| Status | Tracked in the [plan index](README.md) |
| Depends on | Existing frontend on `react-website-overhaul` |
| Blocks | [002 — TypeScript overhaul](002-typescript-overhaul.md) |
| Planned branch | `codex/code-cleanup` |
| PR base | `react-website-overhaul` |
| PR | [#2](https://github.com/avidixit27/avi-dixit.com/pull/2) |

## Outcome

The JavaScript frontend has explicit ownership for the application shell, portfolio, navigation, and scrollbar behavior. Stale route assumptions and unused code are removed, external effects clean up correctly, and the intended visual behavior is preserved so the result is a stable base for TypeScript migration.

## Prerequisites and current state

- Start from the reviewed, committed `react-website-overhaul` state and confirm the working tree does not contain unrelated edits.
- Run and record the current production build result before editing.
- Record browser behavior for home, shop, contact, hero rotation, gallery controls, header visibility, and scrollbar behavior at desktop and mobile sizes.
Reconfirm these findings against the checkout before editing:

- `Portfolio.jsx` combines image discovery, slideshow timing, grid rendering, lightbox selection, image decoding, keyboard behavior, and DOM measurements.
- `Navigation.jsx` combines route presentation, visibility rules, timers, observers, global DOM coordination, and draggable scrollbar behavior.
- `NavigationContext.jsx` and `utils/prefetch.js` refer to `/portfolio`, while the route is `/`. Confirm consumers before correcting or removing obsolete logic.
- `App.jsx` passes a `setHomePageFlag` prop that `Portfolio` does not consume.
- Event listeners, timers, global classes, and scroll locks need explicit ownership and cleanup, including the root scroll listener.

## Scope

- Move application-shell ownership into `src/app/`, with `App.jsx` composing routing, navigation, and the custom scrollbar while `main.jsx` only initializes React and global styles.
- Move portfolio ownership into `src/features/portfolio/`. Separate orchestration, hero presentation, grid presentation, controlled lightbox presentation, and photo/orientation loading into cohesive modules when doing so keeps each responsibility understandable.
- Move the existing contact and shop route components into `src/features/inquiries/` and `src/features/shop/` without redesigning or extending them.
- Keep `BlurImage` shared only if it remains feature-independent; otherwise colocate it with portfolio.
- Remove the unused `setHomePageFlag` contract. Remove `NavigationContext` and `prefetch` only after confirming their behavior has no live consumer; preserve needed behavior locally if a consumer exists.
- Give navigation visibility, scroll activity, scrollbar drag behavior, timers, listeners, observers, document classes, and scroll locks an explicit owner and cleanup path.
- Update imports and the current-state file map in architecture documentation to match the final ownership.

## Non-goals

- TypeScript, ESLint/test infrastructure, new animation dependencies, visual redesign, new product behavior, image optimization or hosting, backend integration, commerce, and legacy-site cleanup.
- Changing the intended landscape-only lightbox navigation policy or completing the broader accessibility redesign without a separately approved behavior change.

Large source photographs, browser-side orientation discovery, and incomplete gallery accessibility remain known limitations unless a cleanup step must touch them to preserve behavior.

## Deliverables

- A feature-oriented JavaScript source layout with imports updated and obsolete modules removed only when proven unused.
- Smaller cohesive portfolio and application-shell units with no hidden element-ID contract between unrelated components.
- Correct cleanup for all affected global effects and a single owner for the custom scrollbar.
- Updated current-state documentation plus recorded browser/build evidence and regression scenarios for plan 003.

## Implementation plan

1. Capture the prerequisite build and browser baseline, including known defects and behavior deliberately preserved.
2. Establish `src/app/` and move shell-owned navigation and scrollbar behavior there. Move the root scroll listener out of the rendering entrypoint and ensure all listeners and timers are removed on cleanup.
3. Establish the portfolio feature and split controlled presentation from orchestration. Pass behavior through props and refs rather than querying elements owned by another feature.
4. Move the current contact and shop route components to feature ownership and update lazy route imports without changing their presentation.
5. Search all consumers, reconcile `/` versus `/portfolio`, remove the ignored prop and confirmed dead context/prefetch code, and exercise direct route entry.
6. Review the final source tree against `architecture.md`; collapse any forwarding-only wrapper and avoid unrelated formatting churn.
7. Repeat the build and browser scenarios, document intentional fixes and remaining limitations, and prepare the handoffs to plans 002 and 003.

## Acceptance criteria

Apply the [temporary bootstrap verification exception](README.md#temporary-verification-exception-plans-001-and-002-only). Use `npm run build` and a local browser before and after the changes; record the commands and observations in the implementation PR.

- Home, shop, and contact navigation and direct entry still render the intended pages.
- Hero rotation and grid order remain consistent with the recorded baseline.
- Opening from the hero or grid, previous/next buttons, arrow keys, Escape, close button, and backdrop behavior preserve the intended gallery sequence, including the current landscape filtering policy unless an explicit correction is approved.
- Closing or leaving the gallery releases scroll locks and does not leave stale global state. Record existing focus limitations without claiming accessibility fixes that were not implemented.
- Header visibility and custom scrollbar behavior remain usable at desktop and mobile sizes; repeated route changes do not duplicate listeners or timers.
- Corrected stale route assumptions and effect cleanup are explained as intentional fixes. No unexplained visual changes are introduced.
- Production build passes. Missing lint and test tooling is reported accurately.

## Verification

- Run `npm run build` before editing and after every coherent ownership move that affects imports, routes, or assets; record the initial and final results.
- Run `npm run dev` and manually exercise home, shop, contact, hero rotation, gallery open/navigate/close behavior, header visibility, and scrollbar behavior at representative desktop and mobile viewports.
- Repeat route changes and gallery mount/unmount cycles while checking the browser console and visible document state for duplicated effects, stale classes, or retained scroll locks.
- Run `git diff --check` and review the final diff and source tree for accidental churn, forwarding-only wrappers, dead imports, and changes outside this ticket.
- Report linting and automated tests as unavailable until plan 003 configures them; do not invent substitute commands or claim the temporary checks are TDD.

## Risks and recovery

| Risk | Mitigation or recovery |
| --- | --- |
| Structural moves change lazy loading or asset resolution | Move one ownership area at a time and run the build plus affected routes after each coherent step. Revert the responsible step if resolution cannot be preserved in scope. |
| Splitting effects duplicates listeners or leaves global state behind | Centralize each effect under one owner and verify repeated navigation, mount, and unmount behavior. |
| Cleanup freezes or changes accidental behavior | Compare against the recorded baseline, call out intentional fixes in the PR, and defer ambiguous product changes. |
| Excessive component extraction increases indirection | Require a sentence-level responsibility for every module and collapse forwarding-only layers before review. |

## Definition of done

- Every in-scope responsibility has an understandable owner and satisfies the acceptance criteria.
- `npm run build` passes and before/after browser evidence is recorded; unavailable lint/test tooling is reported accurately.
- The diff contains only cleanup, necessary file moves, documentation updates, and recorded evidence.
- `architecture.md` and `AGENTS.md` reflect the resulting current source layout without describing future tooling as installed.
- The PR targets `react-website-overhaul`; its link and final status are recorded in the index.
- Plan 002 receives the final ownership map, and plan 003 receives regression scenarios and intentional behavior fixes.

## Handoff

Provide plan 002 with the resulting component ownership and any remaining limitations. Provide plan 003 with the observed regression scenarios and intentional fixes to automate.

## Implementation record

Started on 2026-09-03 from the clean, committed `react-website-overhaul` baseline at `7d8bb80` on branch `codex/code-cleanup`.

### Baseline and outcome

- The baseline production build passed. Desktop and 390 × 844 mobile browser checks captured the home, shop, and contact routes; hero rotation; gallery controls; navigation visibility; and custom scrollbar behavior.
- `src/main.jsx` now only initializes React and global styles. `src/app/` owns routing, navigation, and the custom scrollbar. `src/features/portfolio/` owns portfolio composition, slideshow, grid, controlled lightbox, photo catalog, landscape navigation policy, and orientation loading. Inquiries and shop route components now live with their features.
- The unused `setHomePageFlag` prop, unconsumed navigation context, obsolete `/portfolio` prefetch helper, hidden portfolio element ID, root scroll listener, and DOM-owned timer property were removed after confirming no live consumers.
- The portfolio marker is passed as an element reference, and every affected timer, listener, observer, document class, and scroll lock now has an explicit owner and cleanup path. `BlurImage` remains shared because it has no portfolio-specific behavior.

### Verification evidence

- `npm run build` passed before editing and after each coherent ownership move, including the final source layout.
- Local browser checks passed for direct and client-side entry to `/`, `/shop`, and `/contact` at desktop and mobile sizes. The shop cart still increments and calculates its total.
- Hero rotation preserved its five-second sequence. Hero and grid images opened the gallery; previous/next controls, arrow keys, Escape, close button, and backdrop close behavior worked with the existing landscape-only navigation policy.
- Repeated route changes left one portfolio marker and one custom scrollbar. Gallery closure removed `modal-open`; scrollbar scrolling and dragging remained usable; the clean browser session reported no warning or error entries.
- `git diff --check` passed. `npm run lint` remains unavailable in practice because the repository has no ESLint configuration; no lint or automated test pass is claimed under the temporary bootstrap exception.

### Remaining limitations and handoff

- Large bundled photographs, browser-side orientation discovery, a null lazy-loading fallback, incomplete lightbox focus containment/restoration, placeholder shop behavior, and the contact form without submission remain unchanged and outside this cleanup.
- Plan 002 should migrate the resulting ownership map directly and add strict contracts for route resources, photo records, feature props, and navigation helpers without reorganizing these responsibilities again.
- Plan 003 should automate direct route rendering, hero timer behavior with a controlled clock, gallery open/navigation/close and scroll-lock cleanup, cart totals, repeated mount/navigation cleanup, and desktop/mobile component behavior.
- Implementation and verification were completed in PR [#2](https://github.com/avidixit27/avi-dixit.com/pull/2), which was merged into `react-website-overhaul` on 2026-09-03.
