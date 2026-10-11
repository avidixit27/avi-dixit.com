# 024 — Private Instagram sync and local curation

| Field          | Value                                           |
| -------------- | ----------------------------------------------- |
| Type           | Integration                                     |
| Status         | Planned; approved, awaiting documentation merge |
| Depends on     | Plan 021 architecture approval and merge        |
| Blocks         | Plan 023 owner dashboard                        |
| Planned branch | `feat/instagram-local-sync`                     |
| PR base        | `main` after the documentation PR merges        |
| PR             | Not opened                                      |

## Outcome

The owner can privately bootstrap the verified Instagram account, list its posts, select whole posts and inspect sync health from a local command. Scheduled synchronization and renewal run without a page visit or redeploy. A public JSON endpoint exposes only approved posts. No feed UI is added.

## Prerequisites and current state

- Read Plan 021 and the narrow Instagram decision in `architecture.md`. v26.0 reads returned 26 posts (24 images, 2 reels); the debugger verified only `instagram_business_basic`. Official renewal rules are documented; live renewal remains untested.
- Existing `wrangler.jsonc` deploys assets without a Worker source or storage bindings. Vite already uses the Cloudflare plugin; Wrangler, Vitest and strict TypeScript are installed. Inspect actual integration and test support before adding dependencies.
- Preserve the dirty documentation branch. Start runtime implementation only after explicit approval, the Terra Medium handoff, documentation merge and a clean updated primary checkout.
- This ticket requires approval of the proposals below. Staging provisioning, secret entry and deployment each require explicit authorization; a planning approval is not production-deployment permission.

## Approved decisions

- Runtime stays in this repository as narrow TypeScript Worker code. No new backend framework or provider SDK.
- Private command authentication: a separate high-entropy owner secret in a Worker secret binding; hidden interactive entry, bearer header over HTTPS, constant-time verification before body parsing. Never reuse it in the browser or use Meta credentials to authenticate the owner API.
- Public delivery starts with `Cache-Control: no-store`, no additional CDN/page cache. KV propagation still means removal is not immediate or strictly bounded. Measure deselection propagation before rollout; if a hard removal deadline is required, reconsider the public storage boundary before implementing caching.
- Initial health inspection is through the private `status` command and sanitized Cloudflare logs. No proactive alert delivery is included; the owner must explicitly accept that operational limit or choose an alert channel before production automatic renewal.
- Frontend placement, styling, pagination interaction and playback are separate visual work, not part of this ticket.

## Scope and deliverables

- `worker/instagram/`: provider reads/refresh, boundary validation, normalized catalog, the private Durable Object, selected-snapshot publication and HTTP contracts. Split by demonstrated responsibility, not a generic service framework.
- `worker/index.ts`: thin dispatch to public/owner operations and existing asset serving. All `/api/*` misses return JSON errors, never the SPA.
- `scripts/instagram-owner.mjs`: bootstrap, candidate listing, selection replacement, status and pause/resume only; validate fixed deployment origin, hide credential prompts and sanitize output/errors. No credentials in files, arguments, URLs or logs.
- `wrangler.jsonc`, TypeScript/test configuration and CI: add the Worker entry, one SQLite-backed object and one public KV binding with isolated local/staging resources. Use installed tool support first; approve any necessary dependency additions.
- Colocated tests, a secret-free operator runbook, actual resource evidence, updated architecture and index.

## Contracts

- Public `GET /api/instagram/posts`: Plan 021's selected `PublicPage`, newest first with stable ID tie-breaker; default 12, maximum 24 items. Bound cursor length, include snapshot revision, return 400 for malformed queries, 409 for stale cursors and 503 for unavailable initial state. Valid empty selection returns 200 empty. No owner health or credential fields.
- Private `/api/instagram/owner/*`: candidate listing, status, bootstrap, replacement selection and `POST` pause/resume operations. Authenticate every operation, reject cross-origin browser requests, bound input before reading it and validate operation/method. Reject unknown/duplicate IDs and stale selection revisions; never silently overwrite edits.
- Bootstrap includes privately entered credential, account identity and verified expiry metadata. Issuance can be unknown: do not invent it from debugger output. Record a conservative eligibility time and prohibit renewal until known to be at least 24 hours old. Track data-access expiry separately and require private recovery when invalid.
- Selection is explicit and initially empty. Public revision changes when selected content changes. Persist source/selection publication state; failed KV writes remain pending and are retried without reporting publication success.
- One publication writer in the Durable Object handles every KV snapshot write, including sync, selection edits and retries. Persist the desired revision before starting a write; never start another write while one is unresolved. After settlement, reread the latest source/selection and publish the newest desired revision, skipping superseded queued snapshots. Record success only for the written revision, never clear newer pending work. Reconstruct pending work after restart from durable desired/published revisions; there is no process-only fire-and-forget queue. A generation check after a KV write cannot undo an old write. Runtime tests must verify restart/in-flight-write behavior; if ordering cannot be established, stop rollout and revisit the storage boundary rather than promise monotonic publication. KV propagation can still expose an earlier complete snapshot temporarily.
- Pause persists a disabled scheduling state before removing the alarm. Every alarm entry, retry and rearm path checks that state. Already-running work settles at a safe checkpoint; pause reports `pausing` until it is quiescent, then `paused`. A successful upstream renewal must still be persisted before quiescence, rather than discarded merely because pause was requested. Credential replacement/bootstrap requires quiescence. Private status exposes scheduling state and pending publication; paused recovery must not start further upstream requests or publication writes. Resume is idempotent, preserves catalog/selection/credentials and schedules the next run only after recovery is complete. Already-started remote requests are not claimed to be cancelled.

## Implementation plan

1. Resolve the approval decisions above; inspect existing configuration and confirm the clean branch/base. State exact files and verification before code.
2. Write failing pure tests for validation, normalization, selection, sorting and cursors. Implement bounded v26.0 reads using fixed HTTPS Meta paths, cursor reconstruction and no redirects; never follow an arbitrary upstream URL with credentials. Validate optional media URLs and permalink fallback. Carousel fixtures protect future whole-post support; the current account has no carousel to live-verify.
3. Add the single object and local-runtime storage tests. Commit a complete catalog only after all pages validate. Persist credential/run generations; reject stale completion, handle duplicate alarms and owner recovery. Use a single six-hour alarm, not Cron. Bound traversal, payload and elapsed time; no unbounded retries or traversal inside `blockConcurrencyWhile`.
4. Test renewal with fixture responses, including successful refresh followed by persistence failure. Persist returned token/expiry before success. Record honest health and retain the prior catalog on upstream failures. No live renewal before eligibility and separate authorization.
5. Implement HTTP dispatch and the hidden-input local command. Test auth rejection before parsing, secret exclusion, input bounds, initial unavailable/empty states, stale edits and interrupted publication. Delay an old publication, deselect a post and request a retry; prove writes do not overlap, the newest revision eventually wins and a stale completion cannot clear pending work. Repeat with object restart. Test pause during media fetch, renewal and publication, duplicate alarms while paused, restart while paused and idempotent resume; no completion may rearm a disabled schedule. Do not make candidate metadata public.
6. Build and exercise local Worker asset/API routing with fake credentials and fixtures. Preserve all existing portfolio interactions and static asset caching.
7. With explicit authorization, provision isolated staging resources, privately bootstrap and test actual list/select/unselect/status. Measure normalized bytes, pages/subrequests, CPU/duration, storage operations and deselection propagation. Do not put production credentials in previews or CI.
8. With separate authorization and an eligible token, verify renewal and subsequent media reads privately. Resolve data-access-expiry recovery. Stop rollout if Free limits or operational requirements are unmet; paid upgrades need approval.
9. Review the complete diff with Sol Low after the handoff. Update evidence and request explicit production rollout approval. Merge does not itself authorize deployment or dashboard work.

## Acceptance criteria

- Only selected whole posts are public; newly discovered posts and the full candidate catalog remain private.
- All owner operations reject unauthenticated requests; no token, secret or raw upstream error appears in responses, logs, fixtures or frontend bundles.
- Pagination/validation failure preserves the last complete catalog. Reauthorization and stale async completion cannot overwrite newer credentials/selection; duplicate delivery is safe.
- Renewal respects eligibility and returned expiry. Failed renewal/persistence is not success; both expiry deadlines are visible only in private status.
- Unknown API routes return JSON, asset routes still work and public requests never call Meta.
- Local command edits without Instagram mutations, Git commits or redeployment. Stale edits return a conflict.
- Sync, selection and retries use one serialized publication writer; delayed older writes cannot finish after a newer write from that writer. Latest desired state survives restart and pending publication remains honest. Quiescent pause survives restart, prevents rearming and permits safe credential recovery without deleting stored state.
- Staging evidence establishes actual Free-tier fit and propagation behavior. No production rollout without approved alert/health and recovery policy.

## Verification

Available commands: focused `npm run test:unit -- <spec>`, `npm run typecheck`, `npm run lint`, changed-file Prettier checks and `npm run build`. Extend discovery/typechecking for Worker code without weakening existing coverage. Add a Worker runtime test command only after inspecting installed support; record its exact command here before execution.

Run local runtime integration tests for object persistence, alarm interleaving, routing and auth; pure Vitest mocks alone cannot prove these. Run `npm run test:e2e` for the material Cloudflare/routing change, outside the macOS Cypress sandbox as instructed in AGENTS.md. CI stays credential-free. Report local, staging and production results separately; no live renewal claim from fixtures.

## Risks and recovery

| Risk                                       | Mitigation / recovery                                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Token or owner-secret exposure             | Revoke/rotate privately; stop work and identify the exposure boundary. Never dump raw HTTP errors.                                                |
| Refresh succeeds but storage fails         | Do not claim recovery or blindly repeat renewal; test and document the provider-dependent recovery path.                                          |
| KV propagation retains deselected posts    | No added HTTP caching; measure real propagation. Hard deletion guarantees require a separately approved storage change.                           |
| Free quota exhausted / no proactive alert  | Fail honestly, preserve last good snapshot and use private status; approve monitoring before production.                                          |
| Deployment breaks static portfolio routing | Test asset/API separation; roll back Worker entry, stop the object's alarm, preserve stored data. Code rollback does not restore old credentials. |

## Definition of done

Acceptance tests and proportionate checks pass; real staging and renewal evidence is recorded or explicitly gates rollout. The runbook covers bootstrap, select/unselect, status, expiry/revocation recovery and stopping the alarm. No UI or unapproved service is included. PR/index and architecture reflect actual state. Plan 023 starts only after the local integration is merged and tested.

## Implementation record

Prepared and approved on 2026-10-10; the owner switched to the implementation role and requested execution. The owner then authorized committing and opening the prerequisite documentation PR. Runtime work waits for its merge and a clean updated checkout. No runtime implementation, dependency change, provisioning, secret persistence or deployment performed. Proactive alerts are deferred in favor of private status inspection; production rollout remains separately authorized.

PR #60 review corrections — 2026-10-11: the owner authorized defining one serialized KV publication writer and private pause/resume operations. Added delayed-write/retry/restart and paused-rearm regression requirements. These are implementation contracts, not claims of tested runtime behavior.
