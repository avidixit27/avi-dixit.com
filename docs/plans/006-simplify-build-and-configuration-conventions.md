# 006 — Simplify build and configuration conventions

| Field          | Value                                             |
| -------------- | ------------------------------------------------- |
| Type           | Refactor                                          |
| Status         | Tracked in the [plan index](README.md)            |
| Depends on     | Cloudflare/Vite setup on `chore/setup-cloudflare` |
| Blocks         | None                                              |
| Planned branch | `chore/setup-cloudflare`                          |
| PR base        | `main`                                            |
| PR             | #23                                               |

## Outcome

The project uses one clear configuration convention with less redundant tooling and fewer special cases. Vite owns the PostCSS pipeline, standard `.ts` / `.js` config filenames are used, and duplicate or unnecessary config files are removed while preserving current build behavior.

## Prerequisites and current state

- `package.json` uses `"type": "module"`.
- Vite 8, Tailwind 3, Cloudflare Vite plugin, and `vite-imagetools` are active.
- Responsive image generation and Cloudflare deployment already work.
- PostCSS previously failed through the standalone config loader.
- `vite.config.ts`, `vitest.config.ts`, and `eslint.config.js` are now the canonical config filenames.

## Scope

- Consolidate Vite plugins into a single `vite.config.ts`.
- Move Tailwind and Autoprefixer PostCSS configuration into Vite.
- Remove the redundant standalone PostCSS config.
- Replace `.mts` / `.mjs` config filenames with normal `.ts` / `.js`.
- Align TypeScript and Cypress references with renamed configs.
- Preserve intentional build safeguards and optimization settings.

## Non-goals

- Removing `sourcemap: false`.
- Removing manual Rolldown chunk groups.
- Removing `assetsInclude`.
- Removing the empty Tailwind `plugins` array.
- Redesigning application architecture or performance strategy.

## Deliverables

- Single `vite.config.ts` containing React, imagetools, Cloudflare, and PostCSS configuration.
- `vitest.config.ts`.
- `eslint.config.js`.
- Removal of redundant `.mts`, `.mjs`, and standalone PostCSS config files.
- Updated TypeScript and config references.
- Working build, lint, typecheck, and browser tests.

## Implementation plan

1. Consolidate all Vite behavior into `vite.config.ts`.
2. Configure Tailwind and Autoprefixer directly through Vite and remove the standalone PostCSS config.
3. Rename ESM-specific config filenames to ordinary `.ts` / `.js`.
4. Update TypeScript and Cypress references to canonical config paths.
5. Preserve current explicit build safeguards and manual optimization settings.
6. Run the existing verification pipeline and confirm responsive image behavior remains correct.

## Acceptance criteria

- `npm run build` completes without the previous PostCSS/Tailwind resolution failure.
- Only one Vite configuration is active.
- No `.mts` or `.mjs` config file is required for current tooling.
- Tailwind and Autoprefixer run through Vite's PostCSS configuration.
- Responsive image browser checks continue to pass.
- Cloudflare build and deployment configuration remains functional.
- Intentional `sourcemap`, Rolldown, `assetsInclude`, and Tailwind plugin settings remain unchanged.

## Verification

Automated:

```bash
npm run build
npm run lint
npm run typecheck
npm run test:unit
npm run test:component
npm run test:e2e
```

Repository checks:

```bash
npm ls vite
npm ls @vitejs/plugin-react
npm ls tailwindcss
```

Manual review:

- Confirm the application renders normally.
- Confirm responsive portfolio images are generated rather than exposing raw imagetools query strings.
- Confirm Cloudflare preview and deployment behavior is unchanged.

## Risks and recovery

| Risk                                                         | Mitigation or recovery                                                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Moving PostCSS configuration changes CSS output              | Run build and browser tests; restore previous config if output differs                          |
| Config renames leave stale references                        | Update TypeScript/Cypress references and run typecheck                                          |
| Vite plugin consolidation alters responsive image processing | Preserve imagetools directives and verify generated `srcset` output                             |
| Cleanup removes an intentional safeguard                     | Keep `sourcemap: false`, manual chunk groups, `assetsInclude`, and empty Tailwind plugins array |

## Definition of done

- Implementation and documentation satisfy every in-scope acceptance criterion.
- Relevant available checks pass, and results or justified limitations are recorded.
- The diff contains only ticket scope and receives review.
- Architecture and agent guidance reflect any changed enduring or current-state facts.
- The PR and plan index contain the final status and links.
- Follow-up work is recorded without silently expanding this ticket.

## Implementation record

Completed in PR #23. Consolidated Vite configuration, removed the redundant standalone PostCSS config, standardized config filenames, and eliminated the PostCSS loader failure. Responsive-image browser coverage exposed and validated the earlier duplicate-Vite-config problem. Optional cleanup such as Cypress extension import simplification, Tailwind ESM syntax, `.gitignore` trimming, and archived-site cleanup remains deferred.
