# 021 — Define the Instagram feed sync architecture

| Field          | Value                                                                       |
| -------------- | --------------------------------------------------------------------------- |
| Type           | Architecture                                                                |
| Status         | Tracked in the [plan index](README.md)                                      |
| Depends on     | [017 — Feature availability controls](017-feature-availability-controls.md) |
| Blocks         | A separately approved Instagram implementation ticket                       |
| Planned branch | `docs/instagram-feed-sync-architecture`                                     |
| PR base        | `main`                                                                      |
| PR             | Not opened                                                                  |

## Outcome

Produce a decision-complete, security-reviewed architecture for privately synchronizing top-level posts from Avi Dixit's Professional Instagram account and publicly displaying only owner-selected whole posts. The proposed first version keeps the runtime on Cloudflare, renews the Meta token before it expires, stores a sanitized post catalog for read-heavy delivery, and never exposes credentials to the React application. Synchronization does not require a Git commit or website redeploy. It deliberately stops before service provisioning, credential creation, Worker implementation, or feed design.

The resulting decision will support a later, separately approved implementation ticket. That ticket will design the visual feed, pagination interaction, and placement independently from the curated portfolios.

## Prerequisites and current state

- The owner confirmed on 2026-10-10 that Instagram is a Professional account and Cloudflare is on the Free plan. After Meta app setup, private API reads returned 26 top-level posts: 24 images and 2 reels, with no additional page or carousel albums reported. The owner corrected the earlier count of 27.
- The current repository deploys a static Vite build through one Cloudflare Worker configured in `wrangler.jsonc`. It has no Worker source entry, scheduled handler, KV binding, API route, or server-side Instagram code.
- The Instagram feed is supplemental and must remain separate from the curated portfolio catalog and project routes.
- Plan 017 establishes centralized release visibility. A later Instagram UI must be releasable behind that mechanism until its production sync and presentation are approved.
- Meta's [Instagram API with Instagram Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login) is the candidate integration. Meta's maintained [API collection](https://www.postman.com/meta/instagram/folder/1z5vxzu/instagram-api-with-instagram-login) identifies Business and Creator accounts. Current Facebook Page linkage requirements still need confirmation.
- The earlier proposal assumes a Business-type Meta app and Standard Access for the owned account. These are prerequisites to verify against [Business Login documentation](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login) and the owner's App Dashboard, not current verified account facts.
- The first version reads only owned media and therefore requests only `instagram_business_basic`. It does not request publishing, messaging, comment-management, insights, or Facebook Login permissions.
- Select `v26.0` for versioned media reads based on the owner-provided official version table and successful private v26.0 profile/media reads on 2026-10-10. Both reads returned the same 26-post catalog. Marketing API version dates do not govern this read-only integration.
- The owner supplied the official refresh contract: a long-lived token must be at least 24 hours old and unexpired; renewal grants 60 days and returns `expires_in`. Live renewal remains a separately authorized release check. Owner reauthorization is required after expiry or revocation.
- [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) support scheduled third-party API collection. KV is [encrypted at rest and in transit](https://developers.cloudflare.com/kv/reference/data-security/) and [eventually consistent](https://developers.cloudflare.com/kv/concepts/how-kv-works/). Propagation delay is acceptable for public feed metadata, but not proof that credential updates are serialized.
- AWS Secrets Manager remains a future option. Introducing it now would require an AWS execution environment or another credential that lets Cloudflare call AWS, adding a second control plane before the project otherwise uses AWS.

## Selected design — read feasibility verified, rollout evidence pending

The owner approved automatic renewal through one SQLite-backed Cloudflare Durable Object and selection through a private local command on 2026-10-10. This selects the narrow Instagram integration design, not a general backend platform. Meta feasibility and measured resource usage remain release gates. Credential creation, service provisioning and implementation still require separate authorization.

```text
Owner authorizes one Professional Instagram account
                         │
                         ▼
Meta Instagram API with Instagram Login
                         │
              six-hour alarm / fetch
                         ▼
One private Durable Object
  ├── credential / renewal
  ├── complete source catalog
  └── whole-post selection
       │ publish selected snapshot only
       ▼
Public-feed KV namespace ◄──── Cloudflare Worker
       │
       └── same-origin read-only JSON endpoint
                         │
                         ▼
              React Instagram feature
                         │
                         └── click opens Meta permalink
```

### Responsibility boundaries

| Owner                                  | Responsibility                                                                                                                    |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Meta App Dashboard                     | Verify eligible app/account/access, owner authorization and least-privilege `instagram_business_basic` scope.                     |
| One SQLite-backed Durable Object       | Own renewable credentials, private source catalog, approved IDs, six-hour alarm and serialized publication.                       |
| Worker-bound KV namespace              | Store only the sanitized, selected public snapshot; no Meta token or excluded-post catalog.                                       |
| Worker public endpoint                 | Return bounded cached pages without calling Meta or triggering the Durable Object sync.                                           |
| Private local command / owner endpoint | List candidate metadata and update whole-post IDs through authenticated, narrowly scoped operations; never return the Meta token. |
| React Instagram feature                | Render loading, empty, success, unavailable and pagination states; link to Instagram permalinks.                                  |
| Curated portfolio feature              | Remain independent of Instagram data, availability and failures.                                                                  |

### Credential lifecycle

1. The owner creates or selects a Business-type Meta app, adds the Instagram product, adds the owned Professional account in the App Dashboard, and grants only `instagram_business_basic`.
2. The owner generates a long-lived token through the App Dashboard or completes the server-side short-to-long-lived exchange. The Instagram App Secret is needed for the exchange but is not needed by the documented long-lived-token refresh endpoint and should not remain in the Worker runtime.
3. A one-time private administrative bootstrap writes the token, Instagram account ID, `issuedAt`, `expiresAt`, and schema version through the Durable Object's mutation boundary. No value is committed, printed in CI output, stored in a frontend environment variable, or placed in Wrangler configuration or the public-feed KV namespace.
4. Every scheduled sync checks the recorded expiry. When fewer than 14 days remain, the Durable Object calls Meta's `/refresh_access_token` endpoint with `grant_type=ig_refresh_token` and persists the returned token and new expiry before publishing sync success. Endpoint semantics and expiry handling must be verified before implementation.
5. A refresh failure leaves the still-valid credential and last known good post catalog intact. Observability records only an error class, HTTP status, expiry window, and request correlation data; it must never log token-bearing URLs, authorization headers, response secrets, or the KV value.
6. If the token expires, is revoked, loses permission, or the Instagram account changes type, the Worker stops Meta requests, continues serving the last known good catalog with internal stale health state, and requires owner reauthorization. No architecture can remove this recovery step because Meta requires the owner to grant access.

The Durable Object owns mutable Meta credentials. Do not use KV for token state or add a Cloudflare management credential to runtime merely to rewrite a Worker secret. A static, narrowly scoped owner-command authentication secret is a separate concern from the renewable Meta credential.

**Required concurrency invariant:** one object owns mutations, but asynchronous external requests can still interleave. Persist credential/run generations and reject stale completion after owner recovery. Duplicate alarms must not repeat an already completed renewal or replace a newer snapshot. Keep network requests bounded; do not block the entire traversal with a 30-second concurrency callback. Tests must cover renewal races, duplicate delivery, interrupted persistence and reauthorization before release. KV is never a distributed lock.

Publication has one serialized writer across sync, selection and retry paths. Persist the desired revision; allow only one unresolved KV write, then reread and publish the latest desired state. Superseded queued work is skipped, and stale completion never clears a newer pending revision. Restart recovery reconciles durable desired/published revisions. Verify unresolved-write behavior across restart before rollout; post-write generation checks alone cannot prevent an older remote write from overwriting a newer snapshot. Eventual KV propagation remains distinct from write ordering.

Private pause/resume belongs to the same owner. Persist disabled scheduling before removing the alarm; all alarm/retry/rearm paths honor it. Pause reports quiescence separately from the request being accepted. Let an in-flight renewal persist its returned credential before reporting paused; recovery/bootstrap requires quiescence. Preserve stored state, expose scheduling/publication state only in private status, and make resume idempotent. Test paused restarts and late completions so they cannot silently restart the schedule.

### Full-feed synchronization

- Synchronize every accessible top-level feed media object, including image posts, reels or other video posts, and carousel containers. Stories and transient live media are outside the feed.
- Traverse Meta cursor pagination until completion on each scheduled run. Do not assume response ordering as a durable contract; sort the normalized catalog by timestamp and use the stable Meta media ID as identity.
- Propose one full synchronization every six hours. Successful operation normally discovers new work at the next run; Meta outages or rate limits can extend freshness beyond six hours. Record actual post count, page count, execution time, Worker usage, and sanitized rate-limit metadata during an approved spike; change the interval only from measured evidence.
- Request the smallest useful field set: stable ID, media type, media URL when available, video thumbnail when available, permalink, timestamp, accessibility text when available, and the minimum carousel child data required by the later design.
- Treat media URLs as optional and retain a permalink fallback. Verify exact media fields and omissions against Meta's [IG Media reference](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) before implementation; it was not accessible during this research pass.
- Normalize and validate every Meta response before storage. Missing optional media fields are acceptable. Invalid required identity, timestamp, type, or permalink data fails the candidate catalog instead of silently publishing a feed missing posts. Retain the preceding complete catalog on traversal or required-field validation failure.
- Commit the complete source catalog privately only after traversal succeeds, then publish the current selected subset as one KV snapshot. Catalog, selection and credential mutations share the Durable Object owner; KV publication is not a cross-storage transaction. Failed publication must remain pending for retry, with the previous public snapshot intact. Readers may see either complete snapshot during propagation.
- Do not download, proxy, transform, or permanently archive Instagram media in the first version. The cache contains metadata and Meta-provided delivery URLs only. S3 or another owned-media pipeline requires a separate policy, rights, retention, and cost decision.
- Preserve the last known good catalog when Meta is unavailable. Staleness is preferable to an empty or broken section, but the public response must not reveal credential health or internal error details.

### Browser contract

- Apply the owner-approved whole-post selection described below before public pagination or caching. The private synchronized catalog is not the public feed.
- Expose a same-origin read-only endpoint such as `/api/instagram/posts` from the Worker. The exact path is finalized in the implementation ticket, but it must be short, versionable through its response schema, and independent of Meta's response shape.
- Return bounded pages rather than the complete catalog. The first contract should include a default and maximum page size, an opaque next cursor, `syncedAt`, and sanitized post records.
- Return only fields the presentation needs. Never return access tokens, account IDs used for authorization, expiry timestamps, raw Meta errors, request URLs containing credentials, or Cloudflare storage keys.
- Add cache headers appropriate to the six-hour source interval and allow stale delivery during upstream failure. Browser requests read KV only and never trigger a Meta call or token refresh.
- Return an unavailable result when the initial catalog is missing. Only a successful completed sync can establish an empty Instagram account. The future UI decides whether to hide the section or show a retry state.
- Each post opens its canonical Instagram `permalink`. Exact card composition, captions, carousel affordances, video playback, page size, load-more behavior, and placement remain design decisions for the later implementation ticket.

### Whole-post curation — approved 2026-10-10

- The owner chooses complete Instagram posts, identified by stable media IDs, to avoid displaying duplicate photographs. Selection includes or excludes a carousel as a whole; individual child-photo selection is outside scope.
- Propose one explicit approved-post-ID allowlist. Newly synchronized posts remain hidden until approved. Do not infer selection from filenames, visual similarity, captions, or position in the feed.
- Missing or invalid selection must fail closed: never publish the entire synchronized catalog as a fallback. A valid empty selection yields an empty public feed, distinct from a missing initial catalog or storage failure.
- Filter before pagination and cache publication; public responses must contain no excluded post records. Selection changes must invalidate the public revision/cursors and have an explicit cache-propagation policy so deselected posts do not remain visible indefinitely.
- Selection does not change Instagram itself or the curated portfolio catalogs. Full private metadata synchronization remains the candidate discovery mechanism; approving fewer posts does not automatically reduce Meta list calls.
- The owner approved a private local command. Store selection with the Durable Object and republish from its last complete source catalog on edits, without waiting for the next scheduled sync. Do not introduce an admin dashboard, visual duplicate detector or external authentication provider.

The local command proposes three owner operations: list candidate post metadata/permalinks, replace the approved whole-post ID set, and inspect sanitized sync health. Use a separate scoped owner-authentication secret in a Worker secret binding, supplied privately to the command and never placed in command arguments, URLs or logs. Owner endpoints require authentication before parsing input or invoking the object, reject arbitrary URLs and unknown IDs, and never return credentials. Bootstrap/reauthorization uses the same private mutation owner with separately authorized sensitive input. Reject stale selection revisions rather than silently overwriting a newer choice. This is a proposed security contract, not permission to create a secret or an endpoint now.

## AWS migration boundary

Cloudflare is the preferred first version because it already owns deployment, edge execution, observability, and static delivery. Reconsider AWS Secrets Manager when an AWS control plane already exists for S3, CDN or media processing, or when centralized audit, multi-account credentials, stricter rotation policy, or operational ownership justifies the additional services.

If migration becomes justified, AWS should own the entire privileged Meta operation:

1. Store the Meta credential in AWS Secrets Manager.
2. Use an AWS Lambda execution role and a scheduled Lambda or Secrets Manager rotation function to refresh the token and fetch Meta data without static AWS keys.
3. Publish only sanitized post metadata to a delivery boundary that Cloudflare can cache or the browser can read.
4. Do not make a Cloudflare Worker retrieve the Meta token directly with a long-lived IAM user's access key. That recreates the secret problem across two providers.

AWS documents custom [Secrets Manager rotation through Lambda](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda.html). No managed Meta rotation integration was verified in this research pass; an AWS proposal must explicitly verify or own its refresh behavior. Compare the additional operational cost against the validated Cloudflare candidate rather than assuming more infrastructure is safer.

## Scope

- Verify the current Meta Business app, Instagram Login, access-level, permission, token, media, and API-version requirements against official documentation.
- Confirm the Cloudflare scheduled execution, mutable private storage, complete-catalog publication, read endpoint, cache, observability, and recovery design.
- Define the minimal credential, normalized post, catalog, and public response contracts without copying Meta's entire schema.
- Define whole-post approval by stable media ID, hidden-by-default discovery, and selection-aware pagination/cache behavior without choosing an administration UI.
- Estimate API calls, storage, response size, Worker execution, and expected monthly Cloudflare cost from the account's actual post count.
- Threat-model browser exposure, repository exposure, CI logs, Worker logs, KV administration, token expiry, revoked access, malformed upstream data, and denial-of-service risk.
- Record the approved architecture in `architecture.md` only after the feasibility checks succeed.
- Produce a separate implementation ticket with exact files, infrastructure, tests, rollback, UI decision points, and rollout sequence.

## Non-goals

- Do not provision a Meta app, generate a real access token, create Durable Objects, KV namespaces or schedules, add Worker code, alter Wrangler configuration, or deploy infrastructure in this architecture ticket.
- Do not implement the React feed, visual layout, feed placement, pagination interaction, captions, video playback, carousel navigation, or animation.
- Do not merge Instagram posts into portfolio projects, photo catalogs, search metadata, or project discovery.
- Do not add Instagram publishing, comments, messages, insights, webhooks, account discovery, multiple accounts, or personal-account access.
- Do not request permissions beyond `instagram_business_basic` without a separately documented user-facing requirement.
- Do not call Meta on browser requests, place credentials in Vite variables, expose a token through an API, or log token-bearing requests.
- Do not introduce AWS, Lambda, API Gateway, S3, CloudFront, IAM users, load balancing, another CDN, or cross-cloud secret retrieval in the first implementation.
- Do not promise that owner reauthorization can be automated after revocation or expiry.
- Do not archive Instagram-hosted media or assume its delivery URL is permanent.
- Do not select individual carousel photos, automatically detect duplicates, or build an administration interface under this ticket.

## Deliverables

- Approved architecture decision covering Meta setup, Cloudflare boundaries, full-feed synchronization, browser delivery, failure behavior, and future AWS criteria.
- Official-source requirement matrix with the access level, permission, token lifecycle, endpoint host, pinned API version, supported post types, optional fields, and reauthorization limits.
- Minimal credential, normalized-post, cached-catalog, public-page, and internal-health contract sketches with sensitive fields clearly separated.
- Call-volume, storage-size, response-size, execution-time, and cost estimate based on the real account.
- Threat model and credential bootstrap/runbook that contains no credential values.
- A later implementation ticket with unresolved visual decisions explicitly listed.
- Enduring architecture update only after the decision is validated and approved.

## Implementation plan

1. Recheck Meta's official Instagram Login, Business Login, access token, media reference, App Review, versioning, and changelog pages. Record retrieval date and API version because Meta requirements change independently of this repository.
2. Verify the existing account and app configuration without creating credentials or copying secrets into the ticket. Confirm Professional account eligibility, the required app type, owned-account association, access level, and read permission. An authenticated `/me` and first media-page check requires a separately authorized private client session with an existing token; do not obtain a token under this ticket.
3. Record the account's top-level post count and representative media types. Use those facts to estimate a complete six-hour cursor traversal, normalized catalog size, Worker execution, KV reads and writes, and public page-response size.
4. Write concrete TypeScript-shaped contract sketches for private credential state, normalized image/video/carousel records, last-known-good catalog metadata, health state, and the paginated public response. Keep secrets out of public shapes and keep Meta-specific field names inside the Worker boundary.
5. Walk through successful initial sync, no-new-post sync, new-post sync, token refresh, optional video URL, partial invalid record, pagination failure, rate limit, expired token, revoked permission, empty account, and first-run-without-cache sequences. Resolve each state without visitor-triggered Meta requests.
6. Validate one private SQLite-backed Durable Object and one selected public KV snapshot against measured limits. Do not introduce catalog chunking or additional storage unless evidence requires it.
7. Use one recurring six-hour Durable Object alarm and a proposed 14-day refresh threshold, subject to verified Meta semantics. Do not retain a parallel Cron scheduler. Specify generation-based stale-completion rejection, repeatable publication and recovery tests; keep local/staging fixtures isolated from production credentials.
8. Complete the threat model and least-privilege review. Confirm that no app secret is required after initial exchange, no management API token is introduced solely to rewrite a Worker secret, and no browser or log surface can receive the Meta token.
9. Compare the validated Cloudflare design with the AWS migration boundary. Retain Cloudflare unless an existing AWS platform or concrete security requirement offsets the extra Lambda, Secrets Manager, delivery, monitoring, and cross-cloud ownership.
10. Present the architecture, feed freshness, failure behavior, operational recovery, estimated cost, and deferred design choices for user approval.
11. After approval, update `architecture.md` with the enduring decision and create a separately numbered implementation ticket. Do not provision services or write application code under Plan 021.

## Acceptance criteria

- Official current documentation supports the selected Meta app type, Instagram Login path, Standard Access for the owned Professional account, and `instagram_business_basic` read scope.
- The architecture acknowledges the one-time owner authorization and unavoidable reauthorization after expiry, revocation, permission removal, or account incompatibility.
- Every accessible top-level feed post can be synchronized through bounded cursor pagination without a Git commit, deploy, page visit, webhook, or broader Meta permission.
- The six-hour alarm refreshes a token before expiry, validates a complete upstream result and publishes the selected snapshot only after success. The Durable Object is the mutation owner; stale completion and duplicate delivery cannot overwrite newer state. KV is not used as a distributed lock.
- Meta failure, rate limiting, validation failure, and credential failure preserve the last known good catalog and cannot leak internal errors or secrets to visitors.
- The browser uses a same-origin, cached, paginated contract and never receives a Meta token or causes a Meta request.
- Image, video, reel, and carousel records have explicit optional-field and permalink fallbacks. The design does not assume every post has a usable `media_url`.
- Instagram remains separate from curated portfolio catalogs and routes.
- Only approved whole posts appear publicly. Newly discovered posts remain hidden; missing selection never exposes the private catalog. Selection is applied before pagination, and changes invalidate public revisions with documented cache propagation.
- Measurements show whether one KV catalog remains simple and within platform limits; more complex storage is selected only from evidence.
- The threat model covers repository, CI, logs, public responses, Cloudflare administration, token lifecycle, and recovery.
- AWS remains a documented migration option. No long-lived AWS access key is proposed for a Cloudflare Worker.
- No production credential, service, infrastructure, runtime dependency, or application behavior is created by this ticket.
- A later implementation ticket captures visual design, pagination interaction, exact placement, rollout, tests, monitoring, and provisioning.

## Verification

Architecture verification only:

- Review current official Meta Instagram Login, Business Login, App Review, Access Token, IG Media, versioning, and changelog documentation.
- Review current official Cloudflare Cron Trigger, Workers KV consistency/security/limits, Worker secret, Secrets Store, and observability documentation.
- Review current official AWS Secrets Manager custom rotation and IAM execution-role documentation for the future comparison.
- Any authenticated Meta verification requires separate authorization and an existing token in a private administrative client; redact request URLs, headers, account IDs, and response credentials from evidence. Do not generate credentials under this ticket.
- Calculate full-sync calls and catalog size from the real post count without downloading every media asset.
- Review data-flow and trust-boundary diagrams, contracts, failure sequences, cost estimate, and recovery runbook.
- `npx prettier --check docs/plans/021-instagram-feed-sync-architecture.md docs/plans/README.md`
- `git diff --check`
- Confirm the final diff contains only planning or enduring architecture documentation and no secrets, application code, dependencies, Wrangler changes, or generated artifacts.

Application linting, type checking, unit tests, component tests, E2E tests, builds, security audits, and live infrastructure checks are unnecessary because this ticket changes documentation only.

## Risks and recovery

| Risk                                                   | Mitigation or recovery                                                                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Meta changes permissions, versions, or token behavior  | Pin a supported version, record source dates, monitor the Meta changelog, and reverify before implementation and during dependency reviews. |
| Token expires or access is revoked                     | Refresh with a 14-day margin, alert before expiry, preserve cached posts, and keep a documented owner reauthorization runbook.              |
| KV is treated like a public frontend store             | Bind it only to the Worker, expose a field allowlist through the API, restrict Cloudflare administration, and test for secret absence.      |
| A failed traversal publishes an incomplete feed        | Build a candidate catalog in memory, validate completion, and replace the last known good value with one final write.                       |
| Synchronizing all posts grows expensive                | Measure count, pagination, execution, and payload size; adjust interval or chunking only after a recorded threshold is crossed.             |
| Meta-hosted media URL is absent or later stops working | Treat media URLs as optional, preserve permalink and video-thumbnail fallbacks, and never treat cached metadata as an owned media archive.  |
| Account administration leaks credentials               | Use private interactive setup, redact evidence, prohibit committed values and CI echoing, and rotate immediately after suspected exposure.  |
| Cross-cloud security adds more secrets than it removes | Keep the first version on Cloudflare; if AWS is adopted, place privileged Meta calls in AWS rather than giving Workers static IAM keys.     |
| Feed design overwhelms the curated portfolio           | Keep Instagram in a separate feature and defer presentation, placement, page size, and interaction to user-approved visual design.          |

## Definition of done

- Meta feasibility is verified with the owned Professional account and current official documentation.
- The Cloudflare-only architecture, contracts, sync interval, refresh threshold, storage choice, public boundary, failure policy, and AWS migration criteria are approved.
- Call volume, payload, execution, storage, and expected cost are measured or estimated from the real account and recorded.
- The threat model and reauthorization runbook are complete and contain no secrets.
- Whole-post selection ownership, hidden-by-default behavior, and public cache/revision rules are approved; the later ticket explicitly resolves how the owner edits selections.
- `architecture.md` records only the approved enduring decision, and a separate implementation ticket captures the future code and infrastructure work.
- Documentation formatting and diff checks pass, and the final diff contains no application or infrastructure implementation.
- The plan index includes the final status and PR link after merge.

## Implementation record

### Approved follow-up

The owner approved [Plan 023 — Instagram owner dashboard](023-instagram-owner-dashboard.md) as the next dashboard plan, only after the local-command integration is implemented and tested. Plan 023 reuses the same selection and sync operations; it does not add another credential owner or scheduler. Its browser authentication decision is separate from the private local-command secret. Plan 021 remains architecture-only, and its separately approved integration implementation ticket is still required before the dashboard can start.

### Research checkpoint — 2026-10-10

The user authorized documentation and feasibility work. The primary checkout started at merged `main` commit `18ce7c3`; existing Plan 022 completion/index edits were preserved on `docs/instagram-feed-sync-architecture`. No application code, dependency, infrastructure, credential, or enduring backend choice was changed. Plan 020 was explicitly retired as superseded, not completed as originally written.

### Official-source verification matrix

| Requirement                                                       | Evidence checked on 2026-10-10                                                                                                                                                                                                                                                                              | Result / remaining gate                                                                                                                                                                                                         |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Professional Instagram integration                                | [Meta-maintained API collection](https://www.postman.com/meta/instagram/folder/1z5vxzu/instagram-api-with-instagram-login)                                                                                                                                                                                  | Partial public evidence for Business/Creator integration; not an authenticated account check.                                                                                                                                   |
| App type, owned-account access, permissions, Page linkage         | [Instagram Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login), [Business Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login)                                                | Direct retrieval failed; alternate documentation path returned login-required / HTTP 429. Earlier assumptions remain unverified.                                                                                                |
| Token lifetime, refresh eligibility, media fields, pinned version | [Refresh reference](https://developers.facebook.com/documentation/instagram-platform/reference/refresh_access_token), [media reference](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media), [changelog](https://developers.facebook.com/docs/graph-api/changelog/) | Could not retrieve usable current documentation. No supported version or verified refresh contract selected.                                                                                                                    |
| Scheduling                                                        | [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)                                                                                                                                                                                                                     | UTC scheduling supports the proposed six-hour cadence; delivery exclusivity still needs proof.                                                                                                                                  |
| Storage security and consistency                                  | [KV security](https://developers.cloudflare.com/kv/reference/data-security/), [KV consistency](https://developers.cloudflare.com/kv/concepts/how-kv-works/)                                                                                                                                                 | Encryption is documented; propagation may take 60 seconds or longer. No transactions or atomic lock. Public catalog is a reasonable candidate; credential ownership remains unresolved.                                         |
| Storage budget                                                    | [KV limits](https://developers.cloudflare.com/kv/platform/limits/), [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/)                                                                                                                                                                    | One value is limited to 25 MiB. Free allocation includes 1 GB, 100,000 reads/day and 1,000 writes/day. Same-key writes are limited to one/second.                                                                               |
| Execution budget                                                  | [Worker limits](https://developers.cloudflare.com/workers/platform/limits/)                                                                                                                                                                                                                                 | Free CPU budget is 10 ms/invocation and 50 subrequests; memory is 128 MB. Paid six-hour Cron has up to 15 minutes CPU; scheduled wall time is at most 15 minutes. Network wait is not CPU time. Real workload must be measured. |
| Billing                                                           | [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)                                                                                                                                                                                                                              | Paid account minimum is $5/month with 10 million requests and 30 million CPU-ms included. Existing plan, other usage, and actual workload are unknown. Static asset requests are separately free.                               |
| Same-origin API with SPA                                          | [Worker/static asset routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)                                                                                                                                                                                               | Selective Worker-first API paths can coexist with asset-first SPA routes. A future ticket must test that unknown API paths return JSON errors, not `index.html`; no Wrangler change made.                                       |
| Runtime secret access                                             | [Secrets Store bindings](https://developers.cloudflare.com/secrets-store/integrations/workers/)                                                                                                                                                                                                             | Documented binding reads do not provide runtime mutation. Do not add a broader management token just to rotate Meta credentials.                                                                                                |

### Candidate contracts

These sketches define trust boundaries, not application types or approved UI requirements. Dates are UTC ISO strings; validate them and every external URL before normalization. Retain the existing feature-availability boundary for a later UI. No provider SDK, generic backend framework, database, or Rust service is needed to describe this integration.

`Catalog.posts` below is the private synchronized set in the Durable Object; the KV snapshot and `PublicPage.items` contain only approved posts. Public revision reflects both source catalog and selection changes. A valid empty selection is explicit; absence is not permission to publish everything.

```ts
// Private credential owner only; never returned by the public endpoint.
type Credential = {
  schemaVersion: 1;
  accountId: string;
  accessToken: string;
  issuedAt: string;
  expiresAt: string;
};

type Media = {
  kind: "image" | "video";
  url?: string;
  thumbnailUrl?: string;
  alt?: string;
};

type Post = {
  id: string; // Public media identity, not the private authorization account ID.
  publishedAt: string;
  permalink: string;
} & (
  | { kind: "image" | "video"; media: Media }
  | { kind: "carousel"; children: Media[] }
);

type Catalog = {
  schemaVersion: 1;
  revision: string;
  syncedAt: string;
  posts: Post[];
};

// Private Durable Object state; edits check the preceding revision.
type Selection = {
  schemaVersion: 1;
  revision: string;
  approvedPostIds: string[];
};

type PublicPage = {
  schemaVersion: 1;
  revision: string;
  syncedAt: string;
  items: Post[];
  nextCursor: string | null;
};

// Internal health only; no raw errors, headers, URLs, or credentials.
type SyncHealth = {
  lastAttemptAt: string;
  lastSuccessAt: string | null;
  failureClass: "upstream" | "validation" | "credential" | null;
};
```

Reels normalize to video when supported by the verified media contract. Carousel children and accessibility text remain conditional on API support and the later presentation decision. Keep captions out until a UI requires them. Optional delivery URLs may expire: a stale catalog is not a permanent media archive, and a permalink remains usable independently of image delivery.

The candidate endpoint is read-only `GET /api/instagram/posts`. Propose bounded pages (12 default, 24 maximum), subject to later visual approval. Sort newest first with media ID as the deterministic timestamp tie-breaker. An opaque cursor carries catalog revision plus the last ordering key; validate length and structure, and reject an unknown/stale revision with a reset response instead of mixing pages from different catalogs. A cursor is not authorization and must contain no credential data.

Malformed input returns a generic 400; a stale cursor returns a generic 409 asking the UI to restart; a missing catalog or storage outage returns a generic 503; a verified empty catalog returns 200 with an empty list. Cache successful public pages only using canonical bounded query parameters. Error responses are not cached. Cache lifetimes must include KV propagation in the freshness budget and be finalized with the UI stale/retry policy. Never accept an upstream URL, account identifier, or refresh command from a visitor.

### Failure and recovery decisions

| Sequence                                                             | Candidate behavior                                                                                                                                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial complete sync / unchanged feed                               | Validate every page, deduplicate media identities, sort, then publish one complete catalog. Never advertise a successful sync before the catalog write succeeds.                                              |
| Optional URL unavailable / valid empty feed                          | Retain the post with its permalink; publish an empty catalog only after a successful complete traversal.                                                                                                      |
| Required-field validation, pagination, network or rate-limit failure | Bound requests and total run time; abandon the candidate and keep the preceding catalog. Retry at a later scheduled run, respecting verified Meta limits. Do not retry indefinitely.                          |
| Refresh succeeds but persistence fails                               | Do not mark renewal successful. Raise sanitized internal health failure; recovery must account for whether the previous token remains usable, which requires verified Meta semantics.                         |
| Expired/revoked credential                                           | Serve the last known good catalog, alert the owner through a later approved operational channel, and require private reauthorization. First-run absence stays unavailable rather than becoming an empty feed. |
| Concurrent renewal / owner recovery                                  | Resolve exclusive credential ownership before implementation; do not rely on a KV lease. Pause scheduled work and wait for in-flight work to finish before private recovery, then verify resumed sync.        |
| Rollback                                                             | Hide the future Instagram feature and disable its schedule without disturbing curated portfolios or deleting the last known good catalog. Code rollback does not roll back credentials or stored data.        |

### Workload and cost worksheet

Private reads verified 26 posts (24 images and 2 reels) with no next page or carousel album; the owner confirmed a Professional account and Cloudflare Free. Traffic, serialized metadata size and execution time are unknown. These estimates are not measured capacity or a free-tier guarantee:

- Four runs/day give 120 syncs in a 30-day month. If `N` is post count, `L` the verified page size and `C` the extra child-pagination calls per run, budget `120 × (ceil(N / L) + C)` media calls, plus any account validation and token refresh calls.
- For the verified 26-post single-page result, the baseline is 120 media-list calls/month, plus validation and renewal. Future pagination and carousel expansion can increase this.
- At the illustrative 2 KiB per post, 26 posts produce approximately 52 KiB of catalog metadata, excluding envelope overhead. This is not image/video storage and must be replaced by the actual serialized size. The small post count makes a single catalog a plausible starting point, not proof that its parse/validation work fits the Free CPU budget.
- Assuming `L = 50` and `C = 0` only for arithmetic, 100 / 500 / 1,000 posts imply 240 / 1,200 / 2,400 monthly media calls. Actual endpoint limits and carousel expansion must replace those assumptions. Empty feeds still require a request.
- Assuming 2 KiB per normalized post, those catalogs are approximately 200 KiB / 1 MiB / 2 MiB. Long URLs and carousel children can increase this. Measure actual serialized bytes and per-request parse/validation CPU before approving one catalog value. Network time and CPU time need separate measurements.
- At four successful runs/day, publishing at most one public snapshot per run uses four KV writes/day, plus approved selection edits and retry writes. Private source, health and credential state are Durable Object storage operations, not KV writes; measure their row accounting separately. With 5,000 visits/month and two feed-page requests/visit, uncached delivery would produce roughly 10,000 KV reads/month. Account-wide quotas and uneven daily traffic still matter.
- Free operation is a possibility only if measured execution, subrequests, traffic and storage fit all limits. Paid operation starts at the account's $5/month minimum, not necessarily an additional $5 for this feature when already subscribed. Compare combined usage against the documented included allowances and overage prices before approval.
- No image bytes are stored, transformed or proxied in this candidate. Meta-hosted media transfer is outside the Worker/KV estimate and needs separate cold-load UI testing. More CPU infrastructure cannot eliminate that network download.

### Threat model and owner runbook

| Boundary                  | Safeguard required by the later implementation                                                                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser / public API      | Explicit response field allowlist, HTTPS URL validation, bounded input and pagination, no public write/refresh endpoint, no visitor-triggered Meta fetch. Render any later external text as text, not HTML.       |
| Upstream pagination       | Only follow the verified Meta HTTPS host/path/version; reject redirects or cursor URLs outside that boundary. Bound pages, payload size, duplicates and run time. Never forward a credential to an arbitrary URL. |
| Repository / CI / logs    | No real tokens in fixtures, Vite variables, Wrangler config, build assets or command output. Log only sanitized failure categories. Avoid raw exception dumps that may include credential-bearing fetch URLs.     |
| Cloudflare administration | Restrict namespace/API access; encryption at rest does not prevent authorized administrators from reading values. Keep production credentials isolated from preview/local environments.                           |
| Renewal / recovery        | One verified mutation owner. Keep credential expiry private; test refresh persistence failures, stale reads, duplicate runs and recovery races before release.                                                    |
| Public traffic / cost     | Bound and canonicalize queries; cache successful pages. Validate account-wide budget and available rate controls before choosing an abuse safeguard; no new security service is provisioned here.                 |

Owner bootstrap and reauthorization must happen in an approved private administrative client, never by pasting a token into chat or a PR. Confirm the app/account scope first, stop scheduled mutations during recovery, replace the credential through its chosen owner, validate a complete sync privately, then resume the schedule. On suspected exposure, revoke/rotate the credential and inspect the exposure boundary; deleting a log alone is not recovery.

## Remaining feasibility gates

### Decision package — owner choices recorded

The owner selected the automatic option and private local command on 2026-10-10, and answered “No / not sure” about a configured Meta developer app. The manual option below is retained only as the rejected smaller alternative. Neither option has been provisioned. The selected design above supersedes the earlier KV-credential / Cron proposal.

| Concern                               | Recommended automatic option                                                                                                                                                                                                                                                                         | Smaller manual alternative                                                                                                                                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Private credential and mutation owner | One named SQLite-backed Durable Object owns token state, post selection and synchronization. Publish only the selected public snapshot to KV; keep credentials out of KV.                                                                                                                            | Store a manually renewed token as a Worker secret. The owner updates it before expiry; no runtime token mutation or false KV lock. Scheduled feed collection still requires measured execution limits. |
| Scheduled execution                   | A recurring six-hour Durable Object alarm replaces Cron-driven synchronization. Do not keep two schedulers for the same job.                                                                                                                                                                         | One six-hour Cron remains a candidate, subject to the Free Worker execution budget.                                                                                                                    |
| Duplicate delivery and recovery       | Alarms are at-least-once, not exactly-once. Make publication repeatable; persist run/credential generations and reject stale completion after owner recovery. A single object does not by itself serialize code across external `fetch()` awaits.                                                    | Renewals are an explicit owner operation. Keep staging isolated and serialize catalog publication/recovery; do not treat a secret as automatically renewable.                                          |
| Selection editing                     | Recommend a private local command rather than a new admin UI. It must submit validated whole-post IDs through an authenticated owner-only mutation boundary; ordinary visitor endpoints remain read-only. Authentication and credential handling must be specified before implementing that command. | The same local editing approach; selection never becomes browser-controlled.                                                                                                                           |

[Cloudflare pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) confirms SQLite-backed Durable Objects on Free, with 100,000 requests/day, 13,000 GB-s/day of active duration and 5 GB total SQLite storage. Quota exhaustion fails operations; this is not unlimited free hosting. A four-run daily job taking an illustrative 30 seconds/run uses approximately 15 GB-s/day at the billed 128 MB allocation, excluding retries, administration and other account use. Actual duration must replace that assumption.

[Alarm semantics](https://developers.cloudflare.com/durable-objects/api/alarms/) document automatic retry and one scheduled alarm per object. The [state API](https://developers.cloudflare.com/durable-objects/api/state/) provides concurrency blocking but limits each blocked callback to 30 seconds. Do not wrap an entire unbounded media traversal in that callback. The future implementation must test duplicate alarms, external-request interleaving, renewal persistence failure and owner recovery. Its [execution limits](https://developers.cloudflare.com/durable-objects/platform/limits/) differ from the ordinary Free Worker HTTP/Cron budget; measure both owners separately.

Proposed delivery defaults for either alternative: a missing initial snapshot is unavailable, an explicitly empty approved selection is empty, and a failed upstream sync retains the last known good selected snapshot. Media delivery errors fall back to the Instagram permalink. Use a short public cache lifetime with no unbounded stale-while-revalidate on selection edits; quantify KV propagation separately rather than promising immediate removal. The exact removal deadline and operational alert mechanism remain implementation approval decisions.

Account setup, least-privilege token scope and v26.0 reads are verified through owner-provided private results. Live renewal, future carousel behavior, Free-tier execution and operational rollout policy remain unverified. Plan 021 remains in progress pending final decision approval and documentation review/merge; do not claim production integration.

### Outstanding evidence and approvals

#### Owner-provided official Meta documentation — 2026-10-10

The owner supplied the official refresh reference and Graph API version table after direct retrieval failed. `GET https://graph.instagram.com/refresh_access_token` requires `grant_type=ig_refresh_token`, a valid long-lived Instagram User token at least 24 hours old, and `instagram_business_basic`. The returned `access_token`, `token_type` and `expires_in` define the renewed credential; validity is 60 days from refresh. Calculate persisted expiry from the returned seconds, not a hard-coded duration. The proposed fewer-than-14-days renewal threshold is compatible with this contract. This documents refresh eligibility but does not prove a live renewal, which has not been attempted. Data-access expiry remains a separate deadline; the reference does not establish that refresh extends it.

The supplied Graph API table identifies `v26.0` as the latest listed release, dated July 29, 2026 with expiration TBD. Select it for explicit media-read verification before deployment. The preceding source matrix is historical retrieval evidence, not the final verification status.

1. The owner created the Meta app and connected the Professional Instagram account through Instagram Login. A privately run, temporary read-only probe returned 26 posts: 24 `IMAGE` and 2 `VIDEO`, with both videos identified as `REELS`, and no next page. The owner corrected the earlier count of 27. No carousel albums were reported. Meta's Access Token Debugger showed `Valid: True` and only `instagram_business_basic`; token expiry was approximately two months away and the separate data-access expiry approximately three months away. These are owner-provided authenticated results, not an agent-run production integration. No token or account-ID value is recorded here.
2. Obtain usable current official Meta documentation and authorized account evidence for app/access requirements, media fields, refresh semantics, supported version and pagination. Retrieval failures are not evidence that the integration is unavailable.
3. The Durable Object mutation owner and alarm are approved. Validate concurrency/recovery invariants in the later implementation; finalize stale-media and owner-alert policies before rollout.
4. Cloudflare Free is confirmed. Populate the worksheet with real catalog sizes and a separately authorized execution spike to test its CPU and subrequest limits. Any paid upgrade requires explicit approval; do not provision an experiment under this documentation authorization.
5. Private local selection is approved. Finalize the owner-authentication contract, strict selection validation, public cache propagation and revision behavior in the implementation ticket; no admin UI or external authentication provider is selected.
6. After Meta feasibility is established, record the validated design in `architecture.md` and create the separately scoped implementation ticket. This checkpoint has settled the design direction but does not yet satisfy Plan 021's feasibility-dependent definition of done.

### Next bounded step

Review and approve [Plan 024](024-instagram-local-command-integration.md), including public cache/removal behavior and private health inspection versus proactive alerts. The enduring narrow decision is recorded in `architecture.md`; the general backend remains open. Explicit v26.0 profile/media reads passed with all 26 posts. The official refresh contract is owner-supplied evidence, not a completed live renewal. Plan 024 owns local runtime tests and separately authorized staging/renewal measurements before rollout. Never request a token in chat. Return to planning if these checks change the design.

Documentation verification: Prettier checks for Plans 020–022 and the index, and `git diff --check`. Authenticated Meta calls, runtime measurements, infrastructure tests and application tests were not performed in this documentation-only checkpoint.
