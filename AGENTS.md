# AGENTS.md

`@namesmt/aes-gcm` is a dead-simple, cross-platform AES-GCM encryption/decryption utility: two
async functions (`encrypt`, `decrypt`) over the Web Crypto API, ESM only, Node >= 22, built with
[tsdown](https://github.com/rolldown/tsdown) and tested with [Vitest](https://vitest.dev).

## Docs

Where knowledge lives, and when to reach for each:

| tier | what it holds | when you use it |
| --- | --- | --- |
| `AGENTS.md` — this file | orientation and the rules that prevent defects | read every session; write when a rule is learned the hard way |
| `.agentDocs/` | depth: module rationale, traps with their causes, compatibility | read on demand, before touching that area; write when a rule needs its reasoning kept |
| `docs/` | how-to and reference for a person using this package | read when the task is user-facing; write in the same commit as the change |
| `README.md` | the first read, for a person | write alongside `docs/` |

- **One home per fact.** State the rule here, keep the reasoning in `.agentDocs/` and link it — never both.
- **A dead pointer is a bug.** If the target is gone, delete the pointer rather than leave it.
- Move depth behind a pointer once a section outgrows a screen or two; keep the rule inline.

## Commands

```sh
pnpm run lint             # eslint (@antfu/eslint-config) — it also owns formatting
pnpm run test             # vitest in watch mode locally, once in CI
pnpm run test:types       # tsc --noEmit --skipLibCheck
pnpm run check            # lint + test:types + vitest run --coverage — the release gate
pnpm run build            # tsdown -> dist/index.mjs + dist/index.d.mts
pnpm run release:check    # assert a version is valid and > package.json: `pnpm run release:check 1.2.0`
pnpm run release:preview  # print the changelog the next release would get
pnpm run start            # NODE_ENV=dev tsx src/index.ts — run the source without watching
pnpm run watch            # NODE_ENV=dev tsx watch src/index.ts
pnpm run dev              # alias of `pnpm run watch`
```

## Structure

- `src/index.ts` — entry; `package.json#source` points here (`exports` / `main` / `types` point at `dist/`).
- `src/aes-gcm.ts` — implementation (`encrypt`, `decrypt`, `SEPARATOR`), imported as `#src/aes-gcm.js`.
- `test/index.test.ts` — the only test file; imports through the same `#src/*` alias.
- `playground/` — private workspace package (Vite + nodemon) consuming this one via `workspace:^`, excluded from the root `tsconfig.json`.
- `.github/workflows/` — `ci.yml` (push/PR: `pnpm lint && pnpm test:types && pnpm test`) and `release.yml` (manual, below).

## Conventions

- Conventional commits (`feat:`, `fix:`, `chore:`, …) — changelogen derives the changelog from them.
- ESLint (`@antfu/eslint-config`) owns lint and formatting — run `pnpm run lint` before claiming a change is clean; `simple-git-hooks` + `lint-staged` run `eslint --fix` on every commit.
- ESM only: `"type": "module"` with an `import`-only `exports` map; do not add a CJS build.
- Internal imports use the `#src/*` alias from `package.json#imports`, with a `.js` suffix on `.ts` files.

## How to work here

- **Check the callers before you change anything.** Grep who uses it and which tests name it. If the
  impact is unclear, say so — do not guess.
- **Never overwrite or delete a large section you have not understood.** Read it, or say what you could
  not determine and ask.
- **Do not invent requirements.** Build what was asked; surface what else you notice and let it be
  decided.
- **Fix the class, not the instance.** A copied helper, a rule stated twice, a guard bypassed by a
  second path is one problem: one implementation, one guard. That is the work, not a follow-up to ask
  for. Stay inside the task rather than refactoring the world.
- **Verify before claiming, and say what you checked.** A passing test is not evidence it pins
  anything — **break the thing it guards and watch it fail.** If it still passes, either the test is
  decoration or a different guard is running; find out which. Where a stub cannot answer the question,
  drive the real thing.
- **Never write an identifier from memory.** A commit hash, path, line number or version must be quoted
  from the source; a plausible-looking invented one is worse than none.
- **A stated blocker is a hypothesis, not a fact.** Re-test "cannot install X" / "tool unavailable"
  before inheriting it, and never report a failure your own flag forced.
- **Report the risk with the change** — correctness, security, operational and integration; plus what
  you could not verify and every assumption you made. An unverified claim marked as such beats a
  confident one that is wrong.
- **Missing recall of this repo?** Read this file, `.agentDocs/` and `git log` before acting, then ask
  1–3 focused questions rather than guessing at intent.

## Conciseness

**Prune verbose, keep correctness** — code, comments, docs alike.

- Code: a comment only for non-obvious *intent*, never to restate the line, and never long. A block
  arguing for its own change is a commit message.
- Docs: one idea per sentence. Cut anything that would not change what a reader does.
- Delete history `git log` already holds — keep the *rule* that came out of it, not the story.
- **Never drop a caveat to save a line.** Concise means no filler, not fewer facts.

## User-facing docs

`README.md` is the only one (no `docs/` here). Keep it a **concise first read**; put depth in `<details>` spoilers and add visuals where they help. Docs ship with the change, in the same commit.

## Releasing

- Manual and version-first: dispatch **Actions → Release → Run workflow** with the version; `release.yml` is the only publish path, so a pushed tag publishes nothing.
- It runs `pnpm run check` and `pnpm run build`, then changelogen bumps `package.json`, writes `CHANGELOG.md`, commits, tags `v<version>`, pushes, creates the GitHub release, and publishes to npm over OIDC trusted publishing.
- `dry-run` still lets changelogen write `CHANGELOG.md`, bump `package.json` and create the commit and tag on the runner; it only skips the push, the GitHub release and the npm publish.
- One-time trusted-publisher setup is in the README.

## Gotchas

- `pnpm run check` is the non-watching gate (`vitest run --coverage`); `pnpm test` is watch locally and runs once in CI.
- `dist/` and `coverage/` are gitignored, so changelogen's `--clean` (which fails on a dirty `git status --porcelain`) is not tripped by build or coverage output.
- `package.json` declares Node >= 22 and CI tests on 22.x, but `release.yml` uses Node 24 because npm trusted publishing needs npm >= 11.5.1.
- `decrypt()` throws `Invalid encryptedInput` unless the input splits into exactly two parts on `SEPARATOR` (`|`), and rethrows any Web Crypto failure as `Decrypt failed` after `console.error`.
- `decrypt()` takes a third `returnBuffer` argument: pass `true` to get the raw `ArrayBuffer` (no `TextDecoder` step) instead of a string.
- `repository.url` must keep the canonical `NamesMT` casing — with `--provenance`, npm fails the publish when the URL owner does not match the GitHub owner.
