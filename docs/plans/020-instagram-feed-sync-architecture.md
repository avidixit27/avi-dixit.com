# 020 — Define the Instagram feed sync architecture

| Field          | Value                                                                       |
| -------------- | --------------------------------------------------------------------------- |
| Type           | Architecture                                                                |
| Status         | Tracked in the [plan index](README.md)                                      |
| Depends on     | [016 — Feature availability controls](016-feature-availability-controls.md) |
| Blocks         | A separately approved Instagram implementation ticket                       |
| Planned branch | `docs/instagram-feed-sync-architecture`                                     |
| PR base        | `main`                                                                      |
| PR             | Not opened                                                                  |

## Outcome

Produce a decision-complete, security-reviewed architecture for synchronizing every top-level post from Avi Dixit's Professional Instagram account without a Git commit or website redeploy. The proposed first version keeps the runtime on Cloudflare, renews the Meta token before it expires, stores a sanitized post catalog for read-heavy delivery, and never exposes credentials to the React application. It deliberately stops before service provisioning, credential creation, Worker implementation, or feed design.

The resulting decision will support a later, separately approved implementation ticket. That ticket will design the visual feed, pagination interaction, and placement independently from the curated portfolios.

## Prerequisites and current state

- The Instagram account is confirmed to be a Professional account owned and managed by the site owner.
- The current repository deploys a static Vite build through one Cloudflare Worker configured in `wrangler.jsonc`. It has no Worker source entry, scheduled handler, KV binding, API route, or server-side Instagram code.
- The Instagram feed is supplemental and must remain separate from the curated portfolio catalog and project routes.
- Plan 016 establishes centralized release visibility. A later Instagram UI must be releasable behind that mechanism until its production sync and presentation are approved.
- Meta's current [Instagram API with Instagram Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login) supports Professional Business and Creator accounts and does not require a linked Facebook Page.
- Meta's current [Business Login documentation](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login) says a Business-type Meta app is required. Standard Access is sufficient when an app serves Professional accounts the app owner manages and has added in the App Dashboard; Advanced Access and App Review are required when serving accounts the app owner does not manage.
- The first version reads only owned media and therefore requests only `instagram_business_basic`. It does not request publishing, messaging, comment-management, insights, or Facebook Login permissions.
- As of September 2026, Meta documents Graph API `v26.0` as current. Implementation must pin an explicit supported version and recheck the current version, changelog, and deprecation schedule before provisioning.
- App Dashboard tokens are long-lived for 60 days. A valid long-lived token can be renewed for another 60 days when it is at least 24 hours old, remains unexpired, and retains `instagram_business_basic`. An expired or revoked token cannot be recovered automatically and requires owner reauthorization.
- [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) are designed for scheduled third-party API collection. [Workers KV](https://developers.cloudflare.com/kv/concepts/how-kv-works/) is encrypted at rest, optimized for infrequent writes and high-volume cached reads, and eventually consistent across locations. Its possible propagation delay is acceptable for an Instagram feed.
- AWS Secrets Manager remains a future option. Introducing it now would require an AWS execution environment or another credential that lets Cloudflare call AWS, adding a second control plane before the project otherwise uses AWS.

## Proposed architecture

```text
Owner authorizes one Professional Instagram account
                         │
                         ▼
Meta Instagram API with Instagram Login
                         │
             scheduled server-side fetch
                         ▼
Cloudflare Worker ───────────────► private KV namespace
       │                           ├── credential state
       │                           └── sanitized post catalog
       │
       └── same-origin paginated JSON endpoint
                         │
                         ▼
              React Instagram feature
                         │
                         └── click opens Meta permalink
```

### Responsibility boundaries

| Owner                       | Responsibility                                                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Meta App Dashboard          | Business-type app, owner authorization, Professional account association, Standard Access, and least-privilege `instagram_business_basic` scope |
| Cloudflare scheduled Worker | Refresh the credential when due, retrieve every top-level media record through cursor pagination, validate responses, and publish one catalog   |
| Private Workers KV binding  | Store mutable credential state and the last known good sanitized catalog; never bind KV directly to browser code                                |
| Worker HTTP endpoint        | Return bounded pages of sanitized cached data from the same origin without contacting Meta during a visitor request                             |
| React Instagram feature     | Render loading, empty, success, unavailable, and pagination states; link each item to its Instagram permalink                                   |
| Curated portfolio feature   | Remain independent of Instagram ordering, metadata, media URLs, availability, and failures                                                      |

### Credential lifecycle

1. The owner creates or selects a Business-type Meta app, adds the Instagram product, adds the owned Professional account in the App Dashboard, and grants only `instagram_business_basic`.
2. The owner generates a long-lived token through the App Dashboard or completes the server-side short-to-long-lived exchange. The Instagram App Secret is needed for the exchange but is not needed by the documented long-lived-token refresh endpoint and should not remain in the Worker runtime.
3. A one-time administrative bootstrap writes the token, Instagram account ID, `issuedAt`, `expiresAt`, and schema version into a private KV key. No value is committed, printed in CI output, stored in a frontend environment variable, or placed in Wrangler configuration.
4. Every scheduled sync checks the recorded expiry. When fewer than 14 days remain, the Worker calls Meta's `/refresh_access_token` endpoint with `grant_type=ig_refresh_token` and persists the returned token and new expiry before publishing sync success.
5. A refresh failure leaves the still-valid credential and last known good post catalog intact. Observability records only an error class, HTTP status, expiry window, and request correlation data; it must never log token-bearing URLs, authorization headers, response secrets, or the KV value.
6. If the token expires, is revoked, loses permission, or the Instagram account changes type, the Worker stops Meta requests, continues serving the last known good catalog with internal stale health state, and requires owner reauthorization. No architecture can remove this recovery step because Meta requires the owner to grant access.

The first version uses KV for the active token because the credential must be mutated by scheduled runtime code. A deployed Worker secret or account-level Secrets Store binding is appropriate for static credentials, but updating one from the Worker would require a separate Cloudflare management API credential with write access. That merely replaces one renewable credential with a broader long-lived control-plane credential. Keep the token in one private, encrypted KV namespace unless implementation review identifies a current Cloudflare primitive that supports runtime renewal without that extra credential.

### Full-feed synchronization

- Synchronize every accessible top-level feed media object, including image posts, reels or other video posts, and carousel containers. Stories and transient live media are outside the feed.
- Traverse Meta cursor pagination until completion on each scheduled run. Do not assume response ordering as a durable contract; sort the normalized catalog by timestamp and use the stable Meta media ID as identity.
- Begin with one full synchronization every six hours. This makes new work appear within a bounded interval without calling Meta during page visits. Record actual post count, page count, execution time, Worker usage, and Meta response headers during the implementation spike; change the interval only from measured evidence.
- Request the smallest useful field set: stable ID, media type, media URL when available, video thumbnail when available, permalink, timestamp, accessibility text when available, and the minimum carousel child data required by the later design.
- Treat `media_url` as optional. Meta's [IG Media reference](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) documents cases where a video URL is omitted and recommends falling back to `permalink` or `thumbnail_url`.
- Normalize and validate every Meta response before storage. Reject malformed records individually, record a sanitized count, and retain the preceding complete catalog if the overall traversal or validation fails.
- Replace the complete cached catalog only after every requested page succeeds. A visitor must never observe a half-written feed.
- Do not download, proxy, transform, or permanently archive Instagram media in the first version. The cache contains metadata and Meta-provided delivery URLs only. S3 or another owned-media pipeline requires a separate policy, rights, retention, and cost decision.
- Preserve the last known good catalog when Meta is unavailable. Staleness is preferable to an empty or broken section, but the public response must not reveal credential health or internal error details.

### Browser contract

- Expose a same-origin read-only endpoint such as `/api/instagram/posts` from the Worker. The exact path is finalized in the implementation ticket, but it must be short, versionable through its response schema, and independent of Meta's response shape.
- Return bounded pages rather than the complete catalog. The first contract should include a default and maximum page size, an opaque next cursor, `syncedAt`, and sanitized post records.
- Return only fields the presentation needs. Never return access tokens, account IDs used for authorization, expiry timestamps, raw Meta errors, request URLs containing credentials, or Cloudflare storage keys.
- Add cache headers appropriate to the six-hour source interval and allow stale delivery during upstream failure. Browser requests read KV only and never trigger a Meta call or token refresh.
- Treat a missing initial catalog as an unavailable or empty result rather than a successful empty Instagram account. The future UI decides whether to hide the section or show a retry state.
- Each post opens its canonical Instagram `permalink`. Exact card composition, captions, carousel affordances, video playback, page size, load-more behavior, and placement remain design decisions for the later implementation ticket.

## AWS migration boundary

Cloudflare is the preferred first version because it already owns deployment, edge execution, observability, and static delivery. Reconsider AWS Secrets Manager when an AWS control plane already exists for S3, CDN or media processing, or when centralized audit, multi-account credentials, stricter rotation policy, or operational ownership justifies the additional services.

If migration becomes justified, AWS should own the entire privileged Meta operation:

1. Store the Meta credential in AWS Secrets Manager.
2. Use an AWS Lambda execution role and a scheduled Lambda or Secrets Manager rotation function to refresh the token and fetch Meta data without static AWS keys.
3. Publish only sanitized post metadata to a delivery boundary that Cloudflare can cache or the browser can read.
4. Do not make a Cloudflare Worker retrieve the Meta token directly with a long-lived IAM user's access key. That recreates the secret problem across two providers.

AWS documents custom [Secrets Manager rotation through Lambda](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda.html). Meta is not a documented managed external-secret partner, so any AWS version would own and test custom refresh behavior. A future migration must compare that operational cost with the functioning Cloudflare-only path instead of assuming that more infrastructure is safer.

## Scope

- Verify the current Meta Business app, Instagram Login, access-level, permission, token, media, and API-version requirements against official documentation.
- Confirm the Cloudflare scheduled execution, mutable private storage, atomic catalog publication, read endpoint, cache, observability, and recovery design.
- Define the minimal credential, normalized post, catalog, and public response contracts without copying Meta's entire schema.
- Estimate API calls, storage, response size, Worker execution, and expected monthly Cloudflare cost from the account's actual post count.
- Threat-model browser exposure, repository exposure, CI logs, Worker logs, KV administration, token expiry, revoked access, malformed upstream data, and denial-of-service risk.
- Record the approved architecture in `architecture.md` only after the feasibility checks succeed.
- Produce a separate implementation ticket with exact files, infrastructure, tests, rollback, UI decision points, and rollout sequence.

## Non-goals

- Do not provision a Meta app, generate a real access token, create KV namespaces or Cron Triggers, add Worker code, alter Wrangler configuration, or deploy infrastructure in this architecture ticket.
- Do not implement the React feed, visual layout, feed placement, pagination interaction, captions, video playback, carousel navigation, or animation.
- Do not merge Instagram posts into portfolio projects, photo catalogs, search metadata, or project discovery.
- Do not add Instagram publishing, comments, messages, insights, webhooks, account discovery, multiple accounts, or personal-account access.
- Do not request permissions beyond `instagram_business_basic` without a separately documented user-facing requirement.
- Do not call Meta on browser requests, place credentials in Vite variables, expose a token through an API, or log token-bearing requests.
- Do not introduce AWS, Lambda, API Gateway, S3, CloudFront, IAM users, load balancing, another CDN, or cross-cloud secret retrieval in the first implementation.
- Do not promise that owner reauthorization can be automated after revocation or expiry.
- Do not archive Instagram-hosted media or assume its delivery URL is permanent.

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
2. Verify in the Meta App Dashboard, without copying secrets into the ticket, that the account is Professional, the app type is Business, the owned account can be added, Standard Access is available, and `instagram_business_basic` can read `/me` and the first page of `/<IG_ID>/media`.
3. Record the account's top-level post count and representative media types. Use those facts to estimate a complete six-hour cursor traversal, normalized catalog size, Worker execution, KV reads and writes, and public page-response size.
4. Write concrete TypeScript-shaped contract sketches for private credential state, normalized image/video/carousel records, last-known-good catalog metadata, health state, and the paginated public response. Keep secrets out of public shapes and keep Meta-specific field names inside the Worker boundary.
5. Walk through successful initial sync, no-new-post sync, new-post sync, token refresh, optional video URL, partial invalid record, pagination failure, rate limit, expired token, revoked permission, empty account, and first-run-without-cache sequences. Resolve each state without visitor-triggered Meta requests.
6. Validate that one private KV namespace and one atomic catalog value fit measured limits. If the measured catalog approaches a platform limit or produces an excessive per-request parse cost, document the evidence and choose chunking or per-page keys in the implementation ticket; do not introduce them speculatively.
7. Define a six-hour UTC Cron Trigger and a 14-day refresh threshold as initial policy constants. Document how staging or local fixtures avoid real Meta calls and how production configuration prevents duplicate concurrent writers.
8. Complete the threat model and least-privilege review. Confirm that no app secret is required after initial exchange, no management API token is introduced solely to rewrite a Worker secret, and no browser or log surface can receive the Meta token.
9. Compare the validated Cloudflare design with the AWS migration boundary. Retain Cloudflare unless an existing AWS platform or concrete security requirement offsets the extra Lambda, Secrets Manager, delivery, monitoring, and cross-cloud ownership.
10. Present the architecture, feed freshness, failure behavior, operational recovery, estimated cost, and deferred design choices for user approval.
11. After approval, update `architecture.md` with the enduring decision and create a separately numbered implementation ticket. Do not provision services or write application code under Plan 020.

## Acceptance criteria

- Official current documentation supports the selected Meta app type, Instagram Login path, Standard Access for the owned Professional account, and `instagram_business_basic` read scope.
- The architecture acknowledges the one-time owner authorization and unavoidable reauthorization after expiry, revocation, permission removal, or account incompatibility.
- Every accessible top-level feed post can be synchronized through bounded cursor pagination without a Git commit, deploy, page visit, webhook, or broader Meta permission.
- The proposed six-hour job refreshes a token before expiry, validates a complete upstream result, and atomically replaces the catalog only after success.
- Meta failure, rate limiting, validation failure, and credential failure preserve the last known good catalog and cannot leak internal errors or secrets to visitors.
- The browser uses a same-origin, cached, paginated contract and never receives a Meta token or causes a Meta request.
- Image, video, reel, and carousel records have explicit optional-field and permalink fallbacks. The design does not assume every post has a usable `media_url`.
- Instagram remains separate from curated portfolio catalogs and routes.
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
- Exercise Meta requests only through a private administrative client with a temporary test token; redact all request URLs, headers, IDs, and response credentials from recorded evidence.
- Calculate full-sync calls and catalog size from the real post count without downloading every media asset.
- Review data-flow and trust-boundary diagrams, contracts, failure sequences, cost estimate, and recovery runbook.
- `npx prettier --check docs/plans/020-instagram-feed-sync-architecture.md docs/plans/README.md`
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
- `architecture.md` records only the approved enduring decision, and a separate implementation ticket captures the future code and infrastructure work.
- Documentation formatting and diff checks pass, and the final diff contains no application or infrastructure implementation.
- The plan index includes the final status and PR link after merge.

## Implementation record

Not started. On execution, record the Meta documentation retrieval date and API version, account media count and types, access-level verification, contract decisions, measured call and storage estimates, threat-model result, approved Cloudflare/AWS boundary, remaining visual decisions, documentation checks, and PR link. Never record IDs, tokens, secrets, or token-bearing URLs.
