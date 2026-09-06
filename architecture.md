# Architecture

This document guides the long-term development of Avi Dixit's photography website. It explains ownership, dependencies, component design, and verification. It is a guide for both human contributors and coding agents. Implementation plans and work sequencing live in [docs/plans/README.md](docs/plans/README.md).

## 1. Decision status and scope

The following labels distinguish repository facts from future intentions:

- **Current:** implemented in the repository today.
- **Agreed direction:** a development constraint or product goal accepted during planning, but not necessarily implemented.
- **Planned:** work to introduce through a separately scoped implementation task.
- **Open:** a decision that must not be treated as settled.

Architectural direction does not authorize implementation or service provisioning. Verify current facts against the code and `package.json` when starting a task.

**Backend design is open.** A backend may live in a separate repository. This document does not select its language, framework, database, authentication service, hosting, deployment process, or internal structure.

## 2. Product goals

**Agreed direction:** build a premium photography experience that remains understandable and maintainable as functionality grows.

- Prioritize photographs, intentional typography, responsive layouts, and polished interactions.
- Preserve the current visual direction while deliberately refining navigation, scrolling, animation, and gallery behavior.
- Make reusable React components with explicit inputs and clear responsibilities.
- Support public collections with shareable URLs and search-friendly content and metadata.
- Eventually support owner-managed publishing and working inquiries, followed by print commerce.
- Use tests and small reviewable changes to make sustained development with Codex reliable.

The planning baseline is a curated portfolio of approximately 500 published photographs and 5,000 monthly visits. These are estimates, not measured traffic or capacity guarantees. An approximately $10 monthly operating budget is a preference to validate when hosting is designed; domain registration and component purchases are separate considerations.

The first product milestone is the portfolio and inquiries experience. Publishing administration is a desired capability whose integration depends on later backend decisions. Significant time should be reserved for visual refinement before expanding into commerce.

## 3. Current repository

The repository currently contains a strict TypeScript React application using Vite, Tailwind, and React Router. The manifest specifies React 18, Vite 8, Tailwind 3, React Router 7, and TypeScript 5 version ranges; these are existing dependencies, not permanent version requirements.

| Area             | Current implementation                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry and shell  | `src/main.tsx` initializes React; `src/app/App.tsx` composes the router, navigation, routes, and custom scrollbar                                    |
| Routes           | `/`, `/shop`, and `/contact`, declared in `src/app/App.tsx`                                                                                          |
| Portfolio        | `src/features/portfolio/`, with separate orchestration, slideshow, grid, lightbox, typed photo catalog, and navigation policy modules                |
| Navigation       | `src/app/Navigation.tsx`, which owns navigation visibility and receives the portfolio marker as an explicit prop                                     |
| Custom scrollbar | `src/app/CustomScrollbar.tsx`, which owns its listeners, timers, drag state, and cleanup                                                             |
| Static resources | Typed application navigation data in `src/resources/navigation.ts`; typed feature-specific product data in `src/features/shop/resources/products.ts` |
| Styling          | `src/index.css` and `tailwind.config.js`                                                                                                             |
| Photographs      | Twelve approximately 146 MB JPEG editing sources under `src/imgs/portfolio`; Vite produces delivery-sized JPEG/WebP variants during builds           |
| Shop             | `src/features/shop/Shop.tsx`, with placeholder products and a component-local cart; no integrated checkout                                           |
| Contact          | `src/features/inquiries/Contact.tsx`, with form presentation and no submission integration                                                           |
| Legacy code      | `old_website/`, retained historical implementation                                                                                                   |
| Verification     | ESLint, Prettier, strict TypeScript, Vitest, Cypress component and E2E tests, Husky/lint-staged, and pull-request CI are configured                  |

The application shell and portfolio now have explicit feature-oriented ownership, cross-component DOM coordination uses an explicit element reference, and affected global effects have local cleanup paths. Automated regression coverage protects photo navigation, gallery timers and listeners, route links, contact-form presentation, shop cart behavior, and core desktop/mobile gallery journeys. The responsive catalog supplies intrinsic dimensions and generated sources without exposing original photographs to browsers. The lightbox opens with the source already rendered in the selected hero or grid item, upgrades after its larger source loads, and maintains a bounded rolling cache of decoded responsive neighbors. Large editing sources remain in Git, while placeholder commerce and incomplete gallery focus management remain known limitations for later plans.

## 4. Target frontend organization

**Agreed direction:** use a hybrid structure. Features own product behavior; top-level directories contain application composition and genuinely shared code.

```text
src/
  app/                   Application shell and provider composition
  routes/                Route entrypoints, metadata, and page composition
  features/
    portfolio/           Portfolio browsing and gallery behavior
    inquiries/           Contact form and submission behavior
    publishing/          Future owner publishing interface
  components/            Shared presentation and photography components
  api/                   Shared HTTP transport, introduced when needed
  resources/             App-wide static copy, metadata, and typed catalogs
  styles/                Global styles and design tokens
  assets/                Bundled branding, icons, and other static assets
```

This is an ownership map, not a scaffolding checklist. Create a directory only when its first real implementation needs it. Keep feature-specific components, hooks, types, helpers, constants, resources, and tests together. Do not move assets or add empty publishing modules merely to match the diagram.

### Allowed dependency directions

| Owner             | Allowed responsibilities and dependencies                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| Application       | Compose routes, layout, and providers; coordinate workflows spanning features                                      |
| Routes            | Connect route parameters and page metadata to feature entrypoints                                                  |
| Features          | Own business behavior; use shared components, resources, transport, styles, and their own internal modules         |
| Shared components | Render through explicit props; use shared presentation helpers, resources, and styles                              |
| Shared resources  | Export immutable application-wide content and catalog data without importing React, routes, features, or transport |
| Shared transport  | Handle common HTTP mechanics without importing UI or feature behavior                                              |

- Shared components must not import routes, application providers, feature internals, or perform business API requests.
- A feature must not reach into another feature's internals. Compose their interaction above them, or deliberately extract a shared responsibility.
- Keep feature-specific API operations inside the owning feature. Shared transport must not become a catalog of unrelated business operations.
- Introduce narrow feature entrypoints when another layer needs them; avoid broad barrel files that export every internal symbol.
- Keep constants and utilities beside their owners. Add top-level `constants` or `utils` only when the code has a clear responsibility shared across features.
- Event handlers belong to their component or feature. Do not introduce a general-purpose `handler` directory.
- Avoid circular dependencies and enforce the established boundaries through linting when that tooling is introduced.

There is no assumed backend directory in this repository.

## 5. React components, state, and types

**Agreed direction:** follow the official Rules of React and the guidance applicable to the repository's installed React major. Treat React's recommended Hooks lint rules as correctness rules when linting is configured. Record a deliberate exception when a product or integration constraint requires one; do not preserve a known anti-pattern merely because it currently renders.

### Component responsibilities

Build components around responsibilities a maintainer can describe in a sentence. A gallery layout, photo presentation component, and lightbox can be separate even if each initially has one caller. Reuse count is one reason to extract code, not a prerequisite.

- Treat components and Hooks as pure, idempotent calculations of their inputs. Never mutate props, state, Hook arguments, catalog data, or non-local values during render.
- Prefer explicit props, callbacks, children, and composition.
- Use a small set of meaningful variants for supported presentation differences. Avoid accumulating unrelated boolean flags or one universal component for every page.
- Keep page composition in routes and features; keep generic components independent of the current URL and backend storage representation.
- Reuse established components before introducing another implementation of the same responsibility.
- Declare components and Hooks at module scope so their identity remains stable across renders. Use stable domain IDs or slugs for list keys; do not use array positions when items can be inserted, removed, filtered, or reordered.
- Extract a custom Hook when a specific stateful behavior needs reuse or isolation. A Hook shares logic, not state; lift shared state to the nearest common owner.
- Preserve a component's controlled or uncontrolled contract over its lifetime. Model required callbacks and supported variants explicitly rather than inferring behavior from DOM state.
- Do not wrap a component simply to rename or forward all its props. Wrappers should own a meaningful adaptation or behavior.
- Add memoization only for a measured rendering cost or a required stable reference. Do not scatter `memo`, `useMemo`, or `useCallback` as default ceremony.
- Use route or feature error boundaries where a localized render failure needs recoverable fallback UI. Pair lazy-loaded boundaries with meaningful loading and failure states.
- Treat approximately 200 lines of hand-written source as a prompt to review responsibility and readability. It is not a hard limit, and it does not constrain architecture documentation or generated files.

For example, a photo display component can accept source variants, dimensions, alt text, and presentation options. The portfolio feature decides which photograph is selected and how selection changes. A generic image component should not discover routes, query a database, or decide publication status.

### State and effects

- Keep state local until multiple consumers require shared ownership. Lift it to the nearest common owner before introducing a global provider.
- Use Context for a real shared concern across a subtree; ordinary component customization uses props.
- Keep state minimal and normalized: group values that change together, avoid contradictory or deeply nested shapes, and derive values from props or existing state rather than storing synchronized copies.
- Represent mutually exclusive workflow states with one status or a discriminated union instead of combinations of booleans that permit impossible states.
- Use URL state for navigation and shareable selections when the product requires them. Keep temporary interaction details local.
- Effects synchronize with external systems. Do not use effects for values that can be calculated during rendering.
- Put user-triggered work in event handlers. Keep every Effect dependency complete, make setup and cleanup symmetrical, and handle stale or cancelled asynchronous work when results can arrive after inputs change or a component unmounts.
- Give timers, listeners, observers, scroll locks, and DOM measurements an explicit owner and cleanup path.
- Use refs for DOM integration and non-rendering mutable values. Do not read or write refs during render, and avoid hidden contracts based on another component's element IDs or body classes.
- Enable React Strict Mode in development after the bootstrap cleanup makes effects safe to set up, clean up, and repeat. Fix the effect when Strict Mode exposes a lifecycle problem; do not disable the check to hide it.
- Introduce a reducer or state library only when an actual workflow demonstrates the need.

### TypeScript direction

**Current:** active frontend source and Vite configuration use TypeScript with strict checking, including unchecked-index, exact-optional-property, unused-code, and implicit-return checks. `npm run typecheck` performs a no-emit check independently of the production build. Type component inputs, feature data, and integration boundaries; let inference handle obvious local values.

TypeScript improves component contracts and refactoring feedback. It does not prove that behavior is correct or validate incoming JSON. Validate external data at the integration boundary. Avoid routine use of `any`, unchecked assertions, and suppression comments to bypass a design problem.

Keep types near their owners. A type declaration does not require a new file. Use descriptive domain names such as `Photo`, `Collection`, or `NavigationItem`; do not add `I` prefixes or vague containers such as `Data` when the domain supplies a clearer name.

Use interfaces for stable object-shaped contracts such as component props and domain records when declaration extension is useful. Use type aliases for unions, tuples, mapped or conditional types, and finite workflow states. Prefer inference for local implementation details, literal unions or `as const` data over runtime enums when no enum behavior is needed, and `readonly` contracts for data that consumers must not mutate. Choose the construct that communicates the real shape; do not create parallel interface and type layers for the same value.

### Static resources and catalog data

**Agreed direction:** introduce `src/resources/` with the first application-wide catalog migration. It owns static text, site metadata, shared navigation definitions, and other immutable structured content used across features. Binary images, fonts, and icons remain in `assets/`; editable or server-provided content does not belong in the static resource catalog.

- Organize resources by domain in focused files such as `site.ts`, `navigation.ts`, or `metadata.ts`. Do not create a single miscellaneous copy or constants file.
- Keep feature-specific text and catalogs inside the owning feature, for example `src/features/portfolio/resources/`. A one-off label that is clearer beside its component may remain local; centralize content when it is shared, structured, independently maintained, or needs a stable identifier.
- Keep catalog modules data-only. They must not contain JSX, Hooks, browser effects, API calls, or imports from routes and feature internals.
- Represent each catalog entry as a typed datum with a stable `id` or slug separate from its display text. Store collections as immutable arrays or records so UI components can map them with stable keys.
- Validate catalogs without widening their useful literals, for example with `as const satisfies readonly NavigationItem[]`. Derive types from the source data when that prevents a second schema from drifting; declare an interface when consumers need an explicit durable contract.
- Do not duplicate user-editable or backend-owned data into resources. Map validated external data into feature-owned models at the integration boundary.
- Do not introduce an internationalization framework until localization is approved. Resource ownership should make a later migration possible without inventing translation keys prematurely.

## 6. Visual system and external components

**Agreed direction:** React and Vite remain the application and build foundation. Tailwind remains the primary styling approach for layout, typography, responsive behavior, and simple hover, focus, and state transitions. Establish shared design tokens for color, typography, spacing, radii, layering, and motion. Use global CSS for genuinely global concerns and component-local styles where an effect needs them.

Motion for React is the selected general-purpose runtime for coordinated entrances and exits, page transitions, scroll reveals, scroll-linked transforms, bounded parallax, and justified layout animation. It is planned work until installed by an implementation ticket. Native browser scrolling and CSS layout retain ownership of document flow and sticky positioning; Motion may transform presentation in response to scroll but must not emulate or hijack scrolling. Replace the current JavaScript-driven draggable scrollbar with the native browser scrollbar and, if useful, restrained CSS styling that preserves platform scrolling behavior and accessibility.

| Layer            | Ownership                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| React + Vite     | Component composition, state, routing integration, code splitting, and production bundling                                  |
| Tailwind + CSS   | Layout, typography, responsive styling, design tokens, native sticky behavior, and simple interaction transitions           |
| Motion for React | Coordinated enter/exit behavior, reveals, scroll-linked transforms, parallax, page transitions, and proven layout animation |

Prefer strict `LazyMotion` with the slim `m` components and the smallest feature bundle that supports implemented behavior. Load animation features after semantic content can render, measure bundle cost, and avoid a full `motion` import that defeats lazy loading. Start with `domAnimation`; add layout or gesture features only when an accepted interaction requires them. Introduce another animation runtime only with a concrete, measured justification.

### Candidate sources

| Source                                          | Role                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [Animmaster](https://animmasterlib.dev/)        | Hero, gallery, navigation, and animation examples; assess React compatibility per component |
| [Skiper UI](https://skiper-ui.com/)             | Selected React components and interaction patterns                                          |
| [Vengeance UI](https://www.vengenceui.com/)     | Selected animated components and presentation patterns                                      |
| [Liquid Gooey](https://gooey.jakubantalik.com/) | Expressive visual effects to evaluate individually                                          |
| [Motion](https://motion.dev/)                   | React animation primitives and motion guidance                                              |

These are approved sources to evaluate, not blanket approval to install every dependency or purchase access. Some examples have framework assumptions or paid distribution. Inspect the selected source, dependencies, and applicable license; preserve required attribution and record the source beside adapted code.

Adapt adopted components to the project's TypeScript contracts, tokens, accessibility requirements, and directory ownership. Remove demo content and unrelated behavior. Maintain copied code as project code and test its observable behavior. Do not import a site's global styles or framework setup wholesale.

### Visual acceptance

- Photographs remain the primary content; animation must support the intended viewing experience.
- Support the latest two stable releases of Chrome, Edge, Firefox, and Safari, including the current iOS Safari. Older browsers may receive the complete static experience without every decorative effect.
- Test mobile layouts, touch interaction, keyboard interaction, visible focus, and reduced motion.
- Configure Motion to respect the operating-system reduced-motion preference globally, then remove parallax and large transforms explicitly where automatic behavior is insufficient.
- Lightboxes need clear controls, focus containment and restoration, and predictable scroll recovery.
- Essential content and controls must remain available when animation is reduced or disabled.
- Check both normal motion and reduced motion; do not use the reduced-motion case to hide animation defects.
- Preserve image aspect ratios and known dimensions to limit layout movement.
- Keep editing originals out of browser imports. Generate responsive delivery assets through the configured Vite image pipeline, and expose them through the typed photo catalog rather than constructing URLs in presentation components.
- Give only the first-view hero image high fetch priority. Prepare the next slideshow image without mounting the entire sequence, and lazy load gallery images below the fold.
- Open enlarged media with the selected element's already-rendered source as an immediate sharp preview and size the viewer stage from catalog dimensions. Place each decoded fullscreen image opaquely behind the current visible layer, then fade only that top layer away so overlapping transparency cannot expose or darken the backdrop. During adjacent navigation, retain the outgoing decoded fullscreen image until the incoming responsive image decodes. Preserve rapid navigation intent while a handoff runs, and preload a bounded rolling window using the same responsive format, candidates, and sizes as the viewer. Keep preview selection, decoding, and cache limits in the portfolio feature rather than the shared image component.
- Keep an outgoing hero photograph mounted through its crossfade so the incoming image never fades against the page background. Avoid permanent GPU promotion and paint containment on every gallery card; introduce compositing only for a measured animation need.
- Review real photographs at representative portrait and landscape sizes, including slow loading and failed images.
- Assess bundle size and rendering cost before adopting heavy effects. Avoid unrelated global listeners, permanent animation loops, and unnecessary offscreen work.

Use [Motion's accessibility guidance](https://motion.dev/docs/react-accessibility) when implementing animation behavior. Review selected components with actual site content before treating them as reusable standards.

### Responsive media pipeline

**Current:** `vite-imagetools` transforms portfolio editing sources during `npm run build`. `vite.config.mts` owns the responsive widths, fallback width, and quality setting. The portfolio catalog maps generated, hashed JPEG and WebP URLs into a provider-neutral `Photo` contract with stable IDs, meaningful alternative text, intrinsic dimensions, aspect ratios, and source sets. Shared image presentation consumes that contract through explicit props.

Keep media transformation and URL ownership at the build/catalog boundary. Components must not import an original portfolio photograph directly or know whether a source came from Vite, a future CDN, or another media service. A future hosting migration should replace the catalog adapter while retaining the component contract. Preserve originals as editing inputs unless an approved source-management plan moves them elsewhere. Validate production output size and representative photographic quality whenever widths, formats, or compression settings change.

## 7. Backend integration — work in progress

**Open:** backend language, framework, database, authentication, hosting, deployment, and repository location. A separate backend repository is explicitly permitted.

Go, Python/FastAPI, AWS, S3, DynamoDB, PostgreSQL, Lambda, and Cognito were discussed as possibilities. None is a requirement or a settled architecture decision. Instagram import is an optional future investigation, not a dependency of the public portfolio.

The frontend should be prepared for integration through these principles:

- Agree explicit request, response, and error contracts before implementing a real integration. Decide the contract format and ownership with the backend project.
- Isolate HTTP transport from presentation. Map external representations into the inputs the UI needs.
- Represent loading, empty, success, error, and retry states intentionally. Do not present successful submission or publication before the corresponding operation succeeds.
- Use fixtures and controlled HTTP responses for frontend development and testing. Never mistake a mock workflow for a working production integration.
- Keep backend credentials and private service secrets out of browser code and public build-time variables.
- Treat frontend route guards as user experience, not a substitute for server authorization.
- Avoid dependencies on backend source files or storage-specific types, so the backend can live in another repository.
- Add cancellation, duplicate-submission protection, and retries where the operation's behavior requires them; do not introduce a generic retry framework preemptively.

Owner uploads, metadata editing, collection ordering, private preview, and explicit publication are desired future capabilities. Edited JPEG and PNG are the initial input preference. RAW processing and video are outside that initial preference. These goals do not prescribe a storage schema, endpoint design, or processing service.

Search-ready collection URLs and metadata are frontend goals. Evaluate pre-rendering when the content and publication workflow are defined; no backend rendering or deployment architecture is fixed here.

## 8. Engineering tooling and verification

Installed scripts are defined in `package.json`; [AGENTS.md](AGENTS.md#current-commands-and-tooling-gaps) summarizes current commands and known gaps. The table distinguishes implemented checks from agreed direction. Setup work and proposed command names belong in the implementation plans.

### Current and planned tooling

| Concern                       | Current implementation                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| Runtime                       | Node `22.22.2`, recorded in `.nvmrc` and used by CI                                        |
| Linting                       | ESLint flat configuration with typescript-eslint, React Hooks, and JSX accessibility rules |
| Formatting                    | Prettier, separate from correctness linting                                                |
| Type checking                 | Strict no-emit checks for application and Cypress TypeScript environments                  |
| Local hooks                   | Husky and lint-staged check staged source and supported text                               |
| Pure frontend logic           | Vitest unit tests                                                                          |
| React component behavior      | Cypress Component Testing with Vite and application styles                                 |
| Critical application journeys | Cypress end-to-end tests against the Vite production build                                 |
| Pull-request checks           | Four independent GitHub Actions jobs                                                       |
| Security                      | Dependabot, dependency review, production npm audit, CodeQL, and secret scanning           |

The manifest and lockfile are the source of truth for installed versions. The maintained verification baseline uses Vite 8 with Rolldown, Vitest 5, Cypress 16, and ESLint 9. ESLint remains on version 9 until the installed React and JSX accessibility plugins declare ESLint 10 support; do not override incompatible peer ranges. Tailwind 4 migration belongs to Plan 006 because its configuration and design-token changes require visual review. Cypress is the selected browser test system; do not add Playwright or a duplicate component test stack without a specific requirement.

### Test boundaries

- Use Vitest for pure transformations and business logic, such as deterministic ordering and selection calculations.
- Use Cypress component tests for rendered React behavior, including callbacks, keyboard controls, focus, form states, and interaction among component parts.
- Use Cypress end-to-end tests for a small set of critical route-level journeys against the built frontend. Clearly distinguish intercepted integrations from tests against a real service.
- Colocate unit tests as `*.test.ts` and component tests as `*.cy.tsx`; keep browser journeys and shared Cypress support under `cypress/`.
- Configure discovery and TypeScript environments so each runner loads only its own tests and globals.
- Mount components with real application styles and only the providers they require. Keep fixtures small and representative.
- Test observable outcomes. Avoid assertions coupled to private implementation, snapshots of large component trees, and duplicate coverage across test layers.
- Control network responses and clocks where needed. Wait on observable conditions rather than arbitrary sleeps.
- Report coverage to identify gaps; coverage percentages do not replace meaningful assertions. Do not invent a blanket threshold before a useful baseline exists.

### Red–green–refactor loop

1. Describe the next observable behavior and the files involved.
2. Write a focused unit or component test before implementing that behavior.
3. Run it and confirm it fails because the behavior is missing, not because the test environment is broken.
4. Make the smallest coherent change that passes.
5. Refactor while keeping the tests passing.
6. Run relevant verification before completing the slice and review the diff for scope and readability.

For refactoring, first characterize the behavior that should be preserved. Confirm deliberate behavior changes separately so tests do not freeze accidental prototype behavior. For bug fixes, add a regression test that fails on the bug. For styling, use visual review and relevant interaction tests. Documentation-only changes require document and diff review, not artificial application tests.

Do not claim a red/green loop when the necessary checks could not run. Any user-approved temporary exception must be explicit in the relevant implementation plan or plan index, with a bounded scope, replacement verification, and an exit condition. The default remains test-first behavior changes and regression protection before refactoring.

### Hooks and continuous integration

The pre-commit hook checks staged source files with ESLint and staged supported text files with Prettier. Failed checks block the commit. Fixes remain explicit through developer commands, and the full browser suites stay outside the fast hook.

The GitHub Actions workflow runs when a pull request is opened, synchronized, reopened, or marked ready for review, regardless of its target branch, and on pushes to `main`. Its independent jobs run lint/format/type checks, unit tests, Cypress component tests, and a production build followed by critical browser journeys.

The security workflow runs on the same pull-request events, pushes to `main`, a weekly schedule, and manual dispatch. Dependency review rejects newly introduced dependencies with moderate or higher known vulnerabilities. The production npm audit enforces the same severity floor for the deployable dependency tree, while CodeQL scans JavaScript and TypeScript source for security weaknesses. Dependabot monitors npm and GitHub Actions dependencies and proposes grouped security and routine version updates. GitHub vulnerability alerts, automated security updates, secret scanning, and push protection are enabled at the repository level so advisories and recognized credentials are caught between workflow runs.

Use lockfile-based installation, consistent runtime versions, dependency caching, cancellation of superseded runs, and useful failure artifacts. Configure required checks before merging. Hooks can be bypassed locally, so CI must independently enforce the checks. Cypress Cloud is not required. Deployment is a separate scoped workflow; test CI does not authorize publishing.

Do not add backend jobs to this repository until backend ownership and integration requirements are decided. Frontend PR checks should not require production credentials or live backend services.

## 9. Documentation and planning

| Location                                     | Responsibility                                                                                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `architecture.md`                            | Current system overview, enduring design direction, boundaries, and rationale                                                                                                              |
| `AGENTS.md`                                  | Concise agent instructions and current verification commands                                                                                                                               |
| [docs/plans/README.md](docs/plans/README.md) | Plan status, dependencies, branch relationships, PR links, and shared execution constraints                                                                                                |
| Individual plans                             | End-to-end work tickets containing outcome, prerequisites, bounded scope, non-goals, deliverables, implementation steps, acceptance criteria, verification, risks, and completion evidence |

Read the plan index and only the relevant plan and necessary dependency outcomes. Do not load all plans or completed work by default. Keep branch names, task checklists, temporary exceptions, and progress out of this architecture document.

Keep plan files in a flat directory with stable numeric identifiers and descriptive names. Use the [plan template](docs/plans/TEMPLATE.md) and metadata for change type rather than overlapping feature/chore/fix directories. A ticket must be actionable end to end without relying on conversation history. Substantial work merits a plan; routine small fixes can be explained in their issue or PR without creating another document.

Maintain plan status in the index. Retain completed plans for reference with a link to the implementation PR and verification evidence; historical plans do not override the current architecture. Add a dedicated decision record only when a significant architectural choice needs its alternatives and consequences preserved beyond a task.

The product direction is a premium frontend experience followed by publishing and inquiry integrations, with print commerce later. Detailed sequencing belongs in the plans. Visual refinement requires repeated review with real photographs and representative devices before expanding product scope.

## 10. Architectural changes and working agreements

Keep architecture, agent guidance, and plans consistent without copying their contents between documents. Update the architecture when the system or an enduring decision changes, not for every implementation step.

An approved task authorizes its scoped edits and checks. Seek a decision before materially expanding scope, introducing additional services, or deploying. Do not treat a roadmap item as permission to implement it immediately.

When changing a material architectural decision, update this document in the same pull request. Record the problem, chosen approach, alternatives considered, consequences, migration impact, and verification. Move a decision from open or planned to implemented only when the code supports that status. Routine local implementation choices do not require a separate architecture record.

Do not introduce new layers merely to imitate an architecture pattern. A new module, dependency, or abstraction must solve a present responsibility or an explicitly approved requirement. Never weaken tests or lint rules merely to make a change pass; rule changes need their own rationale.

### Tooling references

- [React: Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
- [React: Choosing the state structure](https://react.dev/learn/choosing-the-state-structure)
- [React: Reusing logic with custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React Hooks ESLint rules](https://react.dev/reference/eslint-plugin-react-hooks)
- [TypeScript overview](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [TypeScript everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript `satisfies` operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)
- [ESLint configuration](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Type-aware linting](https://typescript-eslint.io/getting-started/typed-linting/)
- [Vitest guide](https://vitest.dev/guide/)
- [Cypress React component testing](https://docs.cypress.io/app/component-testing/react/overview)
- [Cypress with GitHub Actions](https://docs.cypress.io/app/continuous-integration/github-actions)
- [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged)
- [Codex AGENTS.md discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
