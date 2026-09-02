# 001 — Code cleanup

Type: Refactor. Status, branch, and PR: [plan index](README.md). Dependency: the existing frontend on the stack's starting branch.

## Purpose

Make the current JavaScript frontend easier to understand and migrate without changing its visual direction. Separate responsibilities and remove confirmed stale assumptions before introducing TypeScript.

## Scope and starting findings

Reconfirm these findings against the checkout before editing:

- `Portfolio.jsx` combines image discovery, slideshow timing, grid rendering, lightbox selection, image decoding, keyboard behavior, and DOM measurements.
- `Navigation.jsx` combines route presentation, visibility rules, timers, observers, global DOM coordination, and draggable scrollbar behavior.
- `NavigationContext.jsx` and `utils/prefetch.js` refer to `/portfolio`, while the route is `/`. Confirm consumers before correcting or removing obsolete logic.
- `App.jsx` passes a `setHomePageFlag` prop that `Portfolio` does not consume.
- Event listeners, timers, global classes, and scroll locks need explicit ownership and cleanup, including the root scroll listener.

Large source photographs, browser-side orientation discovery, and incomplete gallery accessibility are known limitations. Record their current behavior and avoid silently turning this cleanup into an image-delivery or interaction redesign.

## Approach

1. Inspect consumers and record the intended behavior of the existing routes and interactions before editing. Distinguish known defects from behavior to preserve.
2. Keep JavaScript. Move portfolio-specific responsibilities into the portfolio feature and extract cohesive presentation or behavior units where justified. Keep shared components independent of routing and feature internals.
3. Give navigation and scrollbar behavior separate owners. Replace hidden cross-component DOM dependencies with explicit composition or refs where practical within this cleanup.
4. Reconcile route assumptions and remove confirmed unused props, imports, or helpers. Ensure effects release their listeners, observers, timers, and global state.
5. Review each extraction for a clear responsibility; avoid forwarding-only wrappers, empty future directories, and broad formatting churn.

No TypeScript migration, test infrastructure, new animation library, backend, commerce, image-hosting migration, or visual redesign belongs in this change. Preserve the historical `old_website/` implementation.

## Acceptance and verification

Apply the [temporary bootstrap verification exception](README.md#temporary-verification-exception-plans-001-and-002-only). Use `npm run build` and a local browser before and after the changes; record the commands and observations in the implementation PR.

- Home, shop, and contact navigation and direct entry still render the intended pages.
- Hero rotation and grid order remain consistent with the recorded baseline.
- Opening from the hero or grid, previous/next buttons, arrow keys, Escape, close button, and backdrop behavior preserve the intended gallery sequence, including the current landscape filtering policy unless an explicit correction is approved.
- Closing or leaving the gallery releases scroll locks and does not leave stale global state. Record existing focus limitations without claiming accessibility fixes that were not implemented.
- Header visibility and custom scrollbar behavior remain usable at desktop and mobile sizes; repeated route changes do not duplicate listeners or timers.
- Corrected stale route assumptions and effect cleanup are explained as intentional fixes. No unexplained visual changes are introduced.
- Production build passes. Missing lint and test tooling is reported accurately.

## Handoff

Provide plan 002 with the resulting component ownership and any remaining limitations. Provide plan 003 with the observed regression scenarios and intentional fixes to automate. Update the architecture's current-state description if file ownership changes, then update this plan's status and PR link in the index.

## Implementation record

Not started. No implementation checks have been run for this plan. Add a concise outcome or link to PR evidence when implemented.
