# Contributing

This repo is Apache 2.0. Contributions are welcome -- skills, docs, bug fixes,
and CI improvements.

Full authoring guidance lives in `CLAUDE.md`. This file covers the mechanics.

## Repo structure

```
skills/<name>/SKILL.md   one directory per skill, short name (e.g. build)
.claude-plugin/          marketplace manifest for Claude Code — SOURCE OF TRUTH
                         for the plugin version
VERSION                  mirror of plugin.json; read at RUNTIME by
                         hooks/user-prompt and reported as plugin_version in
                         telemetry, so it must never drift
.codex-plugin/           marketplace manifest for Codex
.cursor-plugin/          marketplace manifest for Cursor
```

Each `SKILL.md` has YAML frontmatter and a markdown body:

```yaml
---
version: 0.2.0
name: build
description: |
  One-line purpose, then detail.
---
```

Required frontmatter fields: `version`, `name`, `description`. The
`allowed-tools` key is BANNED (lint-enforced): a restrictive tool list blocks
the skill's own `grid_*` instructions on hosts that enforce it.

## Adding or changing a skill

1. Create a branch. Never commit directly to `main`.
2. Place the skill in `skills/<name>/` with a `SKILL.md`.
3. The skill body must:
   - Bootstrap the CLI: install `@cloudgrid-io/cli` if missing, prompt
     `grid login` if not authenticated.
   - Wrap the `grid` CLI. No direct API calls, with two sanctioned
     exceptions: anonymous drop (`POST /api/v2/drop/auto`) and CLI-free login
     (`/auth/login` + `/auth/status`). See `CLAUDE.md` for details.
   - Detect the user's language from their first message and reply in it.
     Technical flags stay in English.
   - Print results concisely -- URLs and short summaries, never raw JSON or IDs.
4. Set `version:` in frontmatter to this skill's own semver. Per-skill versions
   are INDEPENDENT of the plugin version — bump a skill's version when that
   skill changes, not on every release. (An older instruction here said the
   frontmatter must equal `VERSION`; that was never enforced and never true.)
5. Run the linter locally before pushing:

```
node .github/scripts/lint-skills.mjs
```

## Voice rules

No emoji. No exclamation marks. No marketing adjectives ("seamless", "powerful",
"easy", "blazing", "leverage", "unlock"). Lead with the noun. One sentence per
claim. Eighth-grade reading level. Full rules in `CLAUDE.md`.

## CI checks

These scripts run in CI. All must pass before merge.

- `lint-skills.mjs` -- validates `SKILL.md` YAML frontmatter (required keys are
  present; it does NOT compare version values).
- `check-versions.mjs` -- version coherence: `.claude-plugin/plugin.json` is the
  single source of truth, and `VERSION`, `package.json`, `.codex-plugin/plugin.json`,
  and `.cursor-plugin/plugin.json` must mirror it exactly.
- `corpus-tool-names.mjs` -- edition-safety: only the 14 shared tool names may
  appear as bare `grid_*` tokens in corpus and skill prose.
- `eval-content.mjs` -- behavioral content evals: yaml examples obey the platform
  contract; load-bearing teaching lines are present; banned patterns stay out.
- `no-internal-refs.mjs` -- scans for leaked internal references (org names,
  partnership claims).

Run them locally the same way:

```
node .github/scripts/lint-skills.mjs
node .github/scripts/check-versions.mjs
node .github/scripts/corpus-tool-names.mjs
npm install --no-save yaml && node .github/scripts/eval-content.mjs
node .github/scripts/no-internal-refs.mjs
```

## Releasing

Skills ship by **merging to main** -- the marketplace serves the repo directly.
Bump `.claude-plugin/plugin.json` (PATCH by default), then mirror the same value
into `VERSION` and `package.json`. There is no npm publish: the npm channel is
retired (last publish 0.14.0, 2026-07-09) and `package.json` is `private: true`.
Every documented install path reads the git repo -- `/plugin marketplace add`,
`gh skill install`, and `npx skills add cloudgrid-io/skills`.

## Testing

Load the skill in a fresh agent session and run it against the deployed CLI.
Evidence before claims -- verify the skill does what it says before opening a PR.
See `evals/scenarios.md` for structured evaluation scenarios.

## Installing via gh skill

```
gh skill install cloudgrid-io/skills
```

The `gh skill` extension expects the `skills/<name>/SKILL.md` layout with YAML
frontmatter. That is the format this repo uses, so installation works directly.
