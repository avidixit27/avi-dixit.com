# Architecture

This document guides the long-term development of Avi Dixit's photography website. It explains ownership, dependencies, component design, verification, and the order in which the product should grow. It is a guide for both human contributors and coding agents.

## 1. Decision status and scope

The following labels distinguish repository facts from future intentions:

- **Current:** implemented in the repository today.
- **Agreed direction:** a development constraint or product goal accepted during planning, but not necessarily implemented.
- **Planned:** work to introduce through a separately scoped implementation task.
- **Open:** a decision that must not be treated as settled.

Adding this document and `AGENTS.md` does not implement the target architecture, migrate the application, install tooling, or authorize provisioning services. Verify current facts against the code and `package.json` when starting a task.

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

The repository currently contains a JavaScript React application using Vite, Tailwind, and React Router. The manifest specifies React 18, Vite 5, Tailwind 3, and React Router 7 version ranges; these are existing dependencies, not permanent version requirements.

| Area | Current implementation |
| --- | --- |
| Entry and shell | `src/main.jsx` and `src/App.jsx` |
| Routes | `/`, `/shop`, and `/contact`, declared in `App.jsx` |
| Portfolio | `src/components/Portfolio.jsx`, combining local image discovery, hero slideshow, grid, and fullscreen gallery |
| Navigation | `src/components/Navigation.jsx`, combining navigation, visibility behavior, DOM measurements, and custom scrollbar handling |
| Shared state | `src/context/NavigationContext.jsx` |
| Styling | `src/index.css` and `tailwind.config.js` |
| Photographs | Twelve JPEG files under `src/imgs/portfolio`, totaling approximately 146 MB |
| Shop | Placeholder products and a component-local cart; no integrated checkout |
| Contact | Form presentation with no submission integration |
| Legacy code | `old_website/`, retained historical implementation |
| Verification | A lint script exists, but no ESLint configuration or test setup is present |

### Architectural weaknesses to address

- Portfolio and navigation are each roughly 280 lines and own several different responsibilities. The concern is coupled behavior, rather than the line count alone.
- Navigation queries elements owned elsewhere in the application. Global DOM classes, timers, measurements, and event listeners require clearer ownership and cleanup.
- Navigation context and the prefetch helper still refer to `/portfolio`, although the portfolio route is `/`. Route assumptions have drifted.
- `App` passes a `setHomePageFlag` prop that `Portfolio` does not consume.
- Image orientation is discovered by decoding the source photographs in the browser. Dimensions and display variants should become explicit metadata rather than requiring full-image discovery.
- Gallery accessibility, including keyboard activation, focus management, and reduced motion, needs deliberate acceptance criteria.
- There is no automated regression baseline protecting the current interactions.

These findings guide future work. They are not authorization to refactor everything at once or preserve every prototype behavior as a requirement.

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
  styles/                Global styles and design tokens
  assets/                Bundled branding, icons, and other static assets
```

This is an ownership map, not a scaffolding checklist. Create a directory only when its first real implementation needs it. Keep feature-specific components, hooks, types, helpers, constants, and tests together. Do not move assets or add empty publishing modules merely to match the diagram.

### Allowed dependency directions

| Owner | Allowed responsibilities and dependencies |
| --- | --- |
| Application | Compose routes, layout, and providers; coordinate workflows spanning features |
| Routes | Connect route parameters and page metadata to feature entrypoints |
| Features | Own business behavior; use shared components, transport, styles, and their own internal modules |
| Shared components | Render through explicit props; use shared presentation helpers and styles |
| Shared transport | Handle common HTTP mechanics without importing UI or feature behavior |

- Shared components must not import routes, application providers, feature internals, or perform business API requests.
- A feature must not reach into another feature's internals. Compose their interaction above them, or deliberately extract a shared responsibility.
- Keep feature-specific API operations inside the owning feature. Shared transport must not become a catalog of unrelated business operations.
- Introduce narrow feature entrypoints when another layer needs them; avoid broad barrel files that export every internal symbol.
- Keep constants and utilities beside their owners. Add top-level `constants` or `utils` only when the code has a clear responsibility shared across features.
- Event handlers belong to their component or feature. Do not introduce a general-purpose `handler` directory.
- Avoid circular dependencies and enforce the established boundaries through linting when that tooling is introduced.

There is no assumed backend directory in this repository.

## 5. React components, state, and types

### Component responsibilities

Build components around responsibilities a maintainer can describe in a sentence. A gallery layout, photo presentation component, and lightbox can be separate even if each initially has one caller. Reuse count is one reason to extract code, not a prerequisite.

- Prefer explicit props, callbacks, children, and composition.
- Use a small set of meaningful variants for supported presentation differences. Avoid accumulating unrelated boolean flags or one universal component for every page.
- Keep page composition in routes and features; keep generic components independent of the current URL and backend storage representation.
- Reuse established components before introducing another implementation of the same responsibility.
- Do not wrap a component simply to rename or forward all its props. Wrappers should own a meaningful adaptation or behavior.
- Treat approximately 200 lines of hand-written source as a prompt to review responsibility and readability. It is not a hard limit, and it does not constrain architecture documentation or generated files.

For example, a photo display component can accept source variants, dimensions, alt text, and presentation options. The portfolio feature decides which photograph is selected and how selection changes. A generic image component should not discover routes, query a database, or decide publication status.

### State and effects

- Keep state local until multiple consumers require shared ownership. Lift it to the nearest common owner before introducing a global provider.
- Use Context for a real shared concern across a subtree; ordinary component customization uses props.
- Derive values from existing state rather than storing synchronized copies.
- Use URL state for navigation and shareable selections when the product requires them. Keep temporary interaction details local.
- Effects synchronize with external systems. Do not use effects for values that can be calculated during rendering.
- Give timers, listeners, observers, scroll locks, and DOM measurements an explicit owner and cleanup path.
- Use refs for DOM integration; avoid hidden contracts based on another component's element IDs or body classes.
- Introduce a reducer or state library only when an actual workflow demonstrates the need.

### TypeScript direction

**Planned:** migrate the frontend to TypeScript with strict checking through small coherent changes. Type component inputs, feature data, and integration boundaries; let inference handle obvious local values.

TypeScript improves component contracts and refactoring feedback. It does not prove that behavior is correct or validate incoming JSON. Validate external data at the integration boundary. Avoid routine use of `any`, unchecked assertions, and suppression comments to bypass a design problem.

Keep types near their owners. A type declaration does not require a new file. Do not build elaborate generic abstractions for hypothetical future variants.

## 6. Visual system and external components

**Agreed direction:** Tailwind remains the primary styling approach. Establish shared design tokens for color, typography, spacing, radii, layering, and motion. Use global CSS for genuinely global concerns and component-local styles where an effect needs them.

Use CSS transitions for simple feedback. Motion is the preferred candidate for coordinated React entrances, exits, layout transitions, and gestures. Adopt it when the selected interaction needs it; documentation alone does not install it. Introduce another animation runtime only with a concrete justification.

### Candidate sources

| Source | Role |
| --- | --- |
| [Animmaster](https://animmasterlib.dev/) | Hero, gallery, navigation, and animation examples; assess React compatibility per component |
| [Skiper UI](https://skiper-ui.com/) | Selected React components and interaction patterns |
| [Vengeance UI](https://www.vengenceui.com/) | Selected animated components and presentation patterns |
| [Liquid Gooey](https://gooey.jakubantalik.com/) | Expressive visual effects to evaluate individually |
| [Motion](https://motion.dev/) | React animation primitives and motion guidance |

These are approved sources to evaluate, not blanket approval to install every dependency or purchase access. Some examples have framework assumptions or paid distribution. Inspect the selected source, dependencies, and applicable license; preserve required attribution and record the source beside adapted code.

Adapt adopted components to the project's TypeScript contracts, tokens, accessibility requirements, and directory ownership. Remove demo content and unrelated behavior. Maintain copied code as project code and test its observable behavior. Do not import a site's global styles or framework setup wholesale.

### Visual acceptance

- Photographs remain the primary content; animation must support the intended viewing experience.
- Test mobile layouts, touch interaction, keyboard interaction, visible focus, and reduced motion.
- Lightboxes need clear controls, focus containment and restoration, and predictable scroll recovery.
- Essential content and controls must remain available when animation is reduced or disabled.
- Check both normal motion and reduced motion; do not use the reduced-motion case to hide animation defects.
- Preserve image aspect ratios and known dimensions to limit layout movement. Plan responsive image variants and deliberate eager/lazy loading.
- Review real photographs at representative portrait and landscape sizes, including slow loading and failed images.
- Assess bundle size and rendering cost before adopting heavy effects. Avoid unrelated global listeners, permanent animation loops, and unnecessary offscreen work.

Use [Motion's accessibility guidance](https://motion.dev/docs/react-accessibility) when implementing animation behavior. Review selected components with actual site content before treating them as reusable standards.

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

### Current commands

| Command | Current status |
| --- | --- |
| `npm run dev` | Defined; starts the Vite development server |
| `npm run build` | Defined; builds the frontend |
| `npm run preview` | Defined; serves a built frontend locally |
| `npm run lint` | Defined, but currently blocked by the missing ESLint configuration |

No unit-test, Cypress, type-checking, formatting, or aggregate verification command currently exists. Do not report these checks as passing or run invented scripts. Installing and configuring them is a separate foundation task.

### Planned tooling

| Concern | Agreed direction |
| --- | --- |
| Linting | ESLint flat configuration with typescript-eslint, React Hooks, and JSX accessibility rules |
| Formatting | Prettier, separate from correctness linting |
| Type checking | TypeScript strict checks |
| Local hooks | Husky and lint-staged |
| Pure frontend logic | Vitest unit tests |
| React component behavior | Cypress Component Testing with Vite |
| Critical application journeys | Cypress end-to-end tests |
| Pull-request checks | GitHub Actions |

Use compatible supported versions when implementing the foundation and commit the lockfile. The manifest remains the source of truth for installed versions. Cypress is the selected browser test system; do not add Playwright or a duplicate component test stack without a specific requirement.

Planned command names are `lint`, `format:check`, `format`, `typecheck`, `test:unit`, `test:unit:watch`, `test:component`, `test:component:open`, `test:e2e`, `build`, and `check`. Define them explicitly before documenting them as runnable. The eventual `check` command should compose the frontend release checks.

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

The missing test infrastructure is an explicit bootstrap dependency: establish a functioning test harness before relying on TDD for new behavior. Do not claim a red/green loop if it could not be run.

### Hooks and continuous integration

Pre-commit hooks should check staged source files with ESLint and staged supported text files with Prettier. Failed checks block the commit. Keep fixes explicit through developer commands and keep hooks fast; full browser suites belong in CI.

The planned GitHub Actions workflow runs on pull requests and pushes to the main branch. It includes linting, formatting checks, type checking, unit tests, Cypress component tests, and a production build followed by critical browser journeys. Run independent checks concurrently and make end-to-end tests depend on the build they exercise.

Use lockfile-based installation, consistent runtime versions, dependency caching, cancellation of superseded runs, and useful failure artifacts. Configure required checks before merging. Hooks can be bypassed locally, so CI must independently enforce the checks. Cypress Cloud is not required. Deployment is a separate scoped workflow; test CI does not authorize publishing.

Do not add backend jobs to this repository until backend ownership and integration requirements are decided. Frontend PR checks should not require production credentials or live backend services.

## 9. Acceptance scenarios and roadmap

Acceptance criteria must accompany each implementation task. The following scenarios guide future regression coverage:

- Open a photograph from the hero or grid, navigate the intended sequence, close the lightbox, and restore focus and scrolling.
- Navigate between routes without leaked listeners, timers, or global UI state.
- Use navigation and galleries on small screens with keyboard, mouse, and touch.
- Read useful content with reduced motion and while photographs load or fail.
- Render collections in an explicit stable order and preserve the intended image aspect ratios.
- Display honest pending, success, and failure states for inquiries and publishing once those integrations exist.
- Show search-friendly content and metadata at public collection URLs when those routes are implemented.

| Phase | Outcome and exit condition |
| --- | --- |
| Documentation | Architecture and agent instructions accurately distinguish current state, planned work, and open decisions |
| Verification foundation | Working ESLint, TypeScript, formatting, hooks, Vitest, Cypress, and GitHub Actions with meaningful baseline tests |
| Frontend structure | Responsibilities separated incrementally, dependency rules respected, and intended existing behavior protected |
| Premium frontend | Repeatedly reviewed visual system, gallery, navigation, accessibility, responsive layouts, and image-loading behavior |
| Integration design | Frontend/backend contracts and repository ownership agreed before implementing publishing and inquiry integrations |
| Publishing and launch | Desired owner workflow, public collections, and inquiries verified against the selected integrations and deployment design |
| Print commerce | Product variants, checkout, order lifecycle, and fulfillment designed before implementation |
| Optional integrations | Instagram imports and other additions evaluated independently against a concrete product need |

The premium frontend phase is substantial work, not a single styling pass. Select and review interaction references with real photographs. Do not accelerate into commerce by treating visual polish as complete without review.

## 10. Architectural changes and working agreements

`architecture.md` owns architectural rationale, decision status, and the roadmap. [AGENTS.md](AGENTS.md) owns concise execution instructions and verification expectations. Keep them consistent without duplicating the entire guide.

An approved task authorizes its scoped edits and checks. Seek a decision before materially expanding scope, introducing additional services, or deploying. Do not treat a roadmap item as permission to implement it immediately.

When changing a material architectural decision, update this document in the same pull request. Record the problem, chosen approach, alternatives considered, consequences, migration impact, and verification. Move a decision from open or planned to implemented only when the code supports that status. Routine local implementation choices do not require a separate architecture record.

Do not introduce new layers merely to imitate an architecture pattern. A new module, dependency, or abstraction must solve a present responsibility or an explicitly approved requirement. Never weaken tests or lint rules merely to make a change pass; rule changes need their own rationale.

### Tooling references

- [TypeScript overview](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [ESLint configuration](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Type-aware linting](https://typescript-eslint.io/getting-started/typed-linting/)
- [Vitest guide](https://vitest.dev/guide/)
- [Cypress React component testing](https://docs.cypress.io/app/component-testing/react/overview)
- [Cypress with GitHub Actions](https://docs.cypress.io/app/continuous-integration/github-actions)
- [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged)
- [Codex AGENTS.md discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
