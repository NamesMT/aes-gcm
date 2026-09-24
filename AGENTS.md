# AGENTS.md

`@namesmt/aes-gcm` is a dead-simple, cross-platform AES-GCM encryption/decryption utility: two
async functions (`encrypt`, `decrypt`) over the Web Crypto API, ESM only, Node >= 22, built with
[tsdown](https://github.com/rolldown/tsdown) and tested with [Vitest](https://vitest.dev).

## Commands

```sh
pnpm run lint             # eslint (@antfu/eslint-config) — it also owns formatting
pnpm run test             # vitest in watch mode locally, once in CI
pnpm run test:types       # tsc --noEmit --skipLibCheck
pnpm run check            # lint + test:types + vitest run --coverage — the release gate
pnpm run build            # tsdown -> dist/index.mjs + dist/index.d.mts
pnpm run release:check    # assert a version is valid and > package.json: `pnpm run release:check 1.2.0`
pnpm run release:preview  # print the changelog the next release would get
pnpm run dev              # tsx watch src/index.ts (watch alias); start = same without watch
```

## Structure

- `src/index.ts` — entry; `package.json#source` points here (`exports` / `main` / `types` point at `dist/`).
- `src/aes-gcm.ts` — implementation (`encrypt`, `decrypt`, `SEPARATOR`), imported as `#src/aes-gcm.js`.
- `test/index.test.ts` — the only test file; imports through the same `#src/*` alias.
- `tsdown.config.ts` — build config: entry `src/index.ts`, `dts: true`.
- `vitest.config.ts` — coverage config; `exclude` lists only `tsdown.config.ts`.
- `playground/` — private workspace package (Vite + nodemon) consuming this one via `workspace:^`, excluded from the root `tsconfig.json`.
- `.github/workflows/` — `ci.yml` (push/PR: `pnpm lint && pnpm test:types && pnpm test`) and `release.yml` (manual, below).

## Conventions

- Conventional commits (`feat:`, `fix:`, `chore:`, …) — changelogen derives the changelog from them.
- ESLint via `@antfu/eslint-config` owns formatting (no Prettier; single quotes, 2-space indent). `simple-git-hooks` + `lint-staged` run `eslint --fix` on every commit (wired by `prepare` on install); run `pnpm run lint` before claiming a change is clean.
- ESM only: `"type": "module"` with an `import`-only `exports` map; do not add a CJS build.
- Internal imports use the `#src/*` alias from `package.json#imports`, with a `.js` suffix on `.ts` files.
- The trailing double space in the JSDoc above `encrypt`/`decrypt` is a markdown line break; `eslint.config.js` allows trailing spaces in comments.

## Releasing

- Manual and version-first: dispatch **Actions → Release → Run workflow** with the version; `release.yml` is the only publish path, so a pushed tag publishes nothing.
- It runs `pnpm run check` and `pnpm run build`, then changelogen bumps `package.json`, writes `CHANGELOG.md`, commits, tags `v<version>`, pushes, creates the GitHub release, and publishes to npm over OIDC trusted publishing.
- `dry-run` still lets changelogen write `CHANGELOG.md`, bump `package.json` and create the commit and tag on the runner; it only skips the push, the GitHub release and the npm publish.
- One-time trusted-publisher setup is in the README.

## Gotchas

- `pnpm run check` is the non-watching gate (`vitest run --coverage`); `pnpm test` is watch locally and runs once in CI.
- `dist/` and `coverage/` are gitignored, so changelogen's `--clean` (which fails on a dirty `git status --porcelain`) is not tripped by build or coverage output.
- `package.json` declares Node >= 22 and CI tests on 22.x, but `release.yml` uses Node 24 because npm trusted publishing needs npm >= 11.5.1.
