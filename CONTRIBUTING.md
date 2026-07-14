# Contributing

This repo is Apache 2.0. Contributions are welcome -- skills, docs, bug fixes,
and CI improvements.

Full authoring guidance lives in `CLAUDE.md`. This file covers the mechanics.

## Repo structure

```
skills/<name>/SKILL.md   one directory per skill, short name (e.g. drop)
VERSION                  canonical version; every SKILL.md version tracks it
.claude-plugin/          marketplace manifest for Claude Code
.codex-plugin/           marketplace manifest for Codex
.cursor-plugin/          marketplace manifest for Cursor
```

Each `SKILL.md` has YAML frontmatter and a markdown body:

```yaml
---
version: 0.2.3
name: drop
description: |
  One-line purpose, then detail.
argument-hint: "[file]"
allowed-tools: Bash
---
```

Required frontmatter fields: `version`, `name`, `description`, `allowed-tools`.

## Adding or changing a skill

1. Create a branch. Never commit directly to `main`.
2. Place the skill in `skills/<name>/` with a `SKILL.md`.
3. The skill body must:
   - Bootstrap the CLI: install `@cloudgrid-io/cli` if missing, prompt
     `grid login` if not authenticated.
   - Wrap the `cloudgrid` CLI. No direct API calls, with two sanctioned
     exceptions: anonymous drop (`POST /api/v2/drop/auto`) and CLI-free login
     (`/auth/login` + `/auth/status`). See `CLAUDE.md` for details.
   - Detect the user's language from their first message and reply in it.
     Technical flags stay in English.
   - Print results concisely -- URLs and short summaries, never raw JSON or IDs.
4. Set `version:` in frontmatter to match the value in `VERSION`.
5. Run the linter locally before pushing:

```
node .github/scripts/lint-skills.mjs
```

## Voice rules

No emoji. No exclamation marks. No marketing adjectives ("seamless", "powerful",
"easy", "blazing", "leverage", "unlock"). Lead with the noun. One sentence per
claim. Eighth-grade reading level. Full rules in `CLAUDE.md`.

## CI checks

Two scripts run in CI. Both must pass before merge.

- `lint-skills.mjs` -- validates `SKILL.md` YAML frontmatter (required fields,
  version match).
- `no-internal-refs.mjs` -- scans for leaked internal references (org names,
  partnership claims).

Run them locally the same way:

```
node .github/scripts/lint-skills.mjs
node .github/scripts/no-internal-refs.mjs
```

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
