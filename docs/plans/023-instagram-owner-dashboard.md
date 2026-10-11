# 023 — Select Instagram posts through an owner dashboard

| Field          | Value                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Type           | Feature                                                                                                                 |
| Status         | Planned; tracked in the [plan index](README.md)                                                                         |
| Depends on     | Validated Plan 021 architecture and the separately approved, implemented and tested local-command Instagram integration |
| Blocks         | None                                                                                                                    |
| Planned branch | `feat/instagram-owner-dashboard`                                                                                        |
| PR base        | `main` after the integration merges                                                                                     |
| PR             | Not opened                                                                                                              |

## Outcome

The owner can visually select whole Instagram posts for the website and inspect sanitized sync health, without using the local command for routine curation. New posts remain hidden until approved. Carousels are selected as whole posts, not individual photographs.

The user approved this follow-up on 2026-10-10, explicitly after testing the local command. This is a planned ticket, not implementation authorization. It does not select a general publishing dashboard or authentication provider.

## Prerequisites and current state

- [Plan 021](021-instagram-feed-sync-architecture.md) selects a private SQLite-backed Durable Object for automatic renewal/sync and a local command for initial whole-post selection. Meta app setup, least-privilege scope and v26.0 reads are verified; runtime integration and live renewal are not implemented or tested.
- [Plan 024](024-instagram-local-command-integration.md) must be approved, implemented and tested before this dashboard starts. Record its merged PR and evidence here before execution.
- Required evidence includes initial sync, reel/carousel normalization, hidden-by-default publication, local selection/unselection, stale-edit rejection, renewal/recovery races and public response credential exclusion.
- Reconfirm the resulting API contracts, feature ownership and release controls before choosing files. Read `architecture.md` for enduring boundaries.
- Browser authentication, session lifecycle and owner authorization are material unresolved decisions. Approve them before implementation; do not reuse a long-lived local-command secret in browser code.

## Scope

- Add an owner-only screen showing candidate posts with previews and Instagram permalinks, whole-post selected state, and sanitized sync status.
- Save the selected ID set through the existing selection operation, with revision-based conflict handling and honest pending/success/error states.
- Reuse the integration's validation, publication, credential owner, scheduler and health contract. Keep all Meta operations server-side.
- Put owner UI/API operations with their feature owner; routes compose it. Expected ownership is an owner-facing Instagram feature and thin route integration, using existing shared presentation and transport where suitable. Final paths depend on the implemented integration and must be recorded before editing.
- Add browser authentication/authorization only through the approved security design, including protection of every owner endpoint—not merely a hidden route.

## Non-goals

- No photo uploads, portfolio editing, Instagram publishing, individual carousel selection, duplicate detection, shopping administration or multi-user roles.
- No second scheduler, credential store, independent selection model or browser-to-Meta requests.
- No manual sync button, token editing UI or new recovery workflow unless separately approved.
- No external authentication provider, new infrastructure, dependency or deployment change selected by this roadmap entry.

## Deliverables

- Approved browser authentication and authorization decision with session, logout and request-forgery protections appropriate to that mechanism.
- Accessible owner post-selection screen and sanitized health display using the existing integration contracts.
- Focused regression tests and visual acceptance evidence on mobile and desktop.
- Updated ownership documentation and rollout/recovery instructions.

## Implementation plan

1. Verify prerequisite evidence and record the integration plan/PR, actual owners, contracts and exact touchpoints. Stop if the local workflow is not reliable.
2. Resolve browser authentication, owner authorization and session handling with the user. Define how the dashboard authenticates without exposing Meta or local-command credentials; approve any service or cost explicitly.
3. Agree the minimal visual layout, route and release policy. Do not silently add the private screen to public navigation.
4. Protect owner operations server-side. Test unauthenticated/unauthorized access and credential exclusion before building UI.
5. Implement candidate listing and whole-post selection against the existing contracts. Submit the preceding selection revision; surface conflicts without silently overwriting newer choices.
6. Test loading, empty, failed loads/saves, conflicts, deselection and publication propagation. Keep selected state honest until the server confirms the update.
7. Review mobile/desktop, touch, keyboard, focus and reduced motion with representative photos. Obtain visual approval before committing UI changes.
8. Run proportionate verification, review the final diff and update documentation/PR evidence. Release only after explicit approval.

## Acceptance criteria

- Only an authenticated, authorized owner can read candidate metadata or mutate selection; direct HTTP requests cannot bypass the check.
- No Meta token, local-command secret or authorization account ID enters frontend bundles, browser responses or client logs.
- The screen and local command use the same selected ID set and mutation rules. Either can observe the other's confirmed updates.
- New posts are unselected; selecting a carousel applies to the whole post. The dashboard cannot publish excluded posts through a client-side filter alone.
- Failed saves do not show success, and conflicting revisions require explicit recovery rather than overwriting newer selections.
- The UI distinguishes selection accepted, publication pending and public cache propagation where the integration exposes those states. Do not imply immediate removal if delivery is eventually consistent.
- The public portfolio, gallery, navigation and Instagram read endpoint remain unchanged except for owner-approved selected content.
- Owner UI works with keyboard/touch and representative viewport sizes; loading and error states are accessible.

## Verification

- Focused Vitest tests for new pure logic and Cypress component tests for selection/save/conflict behavior.
- Server authorization and integration tests using the backend test command established by the prerequisite ticket; record that exact command before implementation. Frontend mocks alone do not prove authorization.
- `npm run typecheck`, changed-file ESLint/Prettier checks and `npm run build` for the new route and release behavior.
- Focused Cypress E2E for the owner workflow and unauthorized access, plus affected public journeys; record exact specs once they exist.
- Inspect production bundles and sanitized responses for credential absence. Verify cold loading and failed requests in a live browser without production credentials in artifacts.
- Documentation-only planning checks: Prettier for this ticket/index and `git diff --check`. No application test is claimed for this planned state.

## Risks and recovery

| Risk                                        | Mitigation / recovery                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Private route is mistaken for authorization | Authenticate and authorize server-side before every owner operation; test direct requests.                               |
| CLI secret becomes a browser credential     | Approve a separate browser-session design; never embed the local secret or Meta token in frontend code.                  |
| Dashboard forks sync/selection behavior     | Reuse the existing integration operations and invariant tests; add presentation only.                                    |
| Stale screen overwrites newer curation      | Require the preceding revision; surface conflicts and reload safely.                                                     |
| Deselected posts linger in delivery caches  | Use the integration's publication/propagation contract and show truthful state; do not invent another cache policy.      |
| New UI is unreliable                        | Disable its release entry and retain the tested local command; do not roll back or delete selected state or credentials. |

## Definition of done

- All prerequisites and security/visual decisions are resolved and recorded before coding.
- Acceptance criteria, focused tests and real-browser visual review pass.
- No duplicated privileged logic or leaked credentials remain.
- The user approves rollout, documentation reflects actual ownership, and the index/PR record verification and final status.

## Implementation record

Not started. Follow-up approved for planning on 2026-10-10; gated on a working, tested local-command integration. Browser authentication and exact code touchpoints remain open. No dashboard code, credentials, services or deployment were created.
