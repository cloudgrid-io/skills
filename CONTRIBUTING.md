# Contributing

This repo is MIT licensed. Contributions are welcome -- skills, docs, bug fixes,
and CI improvements.

## Repo structure

```
plugins/cloudgrid/       the Claude Code plugin folder (what the plugin
                         directory reviews and what users install)
  .claude-plugin/plugin.json  plugin manifest; SOURCE OF TRUTH for the version
  skills/<name>/SKILL.md      one directory per skill, short name (e.g. build)
  README.md                   listing README: what the plugin runs, sends, and
                              connects to
.claude-plugin/          marketplace manifest for Claude Code
VERSION                  mirror of plugin.json
.codex-plugin/           plugin manifest for Codex (skills path points into
                         plugins/cloudgrid/skills/)
.cursor-plugin/          plugin manifest for Cursor (same)
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
2. Place the skill in `plugins/cloudgrid/skills/<name>/` with a `SKILL.md`.
3. The skill body must:
   - Use the `grid` CLI for files on disk and the CloudGrid connector tools
     for content in the conversation. No direct API calls.
   - Print results concisely -- URLs and short summaries, never raw JSON or IDs.
4. Set `version:` in frontmatter to this skill's own semver. Per-skill versions
   are INDEPENDENT of the plugin version: bump a skill's version when that
   skill changes, not on every release. (An older instruction here said the
   frontmatter must equal `VERSION`; that was never enforced and never true.)
5. Run the linter locally before pushing:

```
node .github/scripts/lint-skills.mjs
```

## Scope

In this repo: the skills, the plugin and marketplace manifests, the app
templates and workflows, and the install and usage docs.

Not in this repo, and not to be added:

- The `grid` CLI. Do not re-implement or fork CLI behavior here; if a skill
  needs something the CLI does not do, file an issue on cloudgrid-io/cli.
- Platform code (API, manifests, infrastructure).
- Any sign-in flow other than `grid login` and the connector's own sign-in.
- Partnership claims or internal team and organization names in public docs.

## Voice rules

No emoji. No exclamation marks. No marketing adjectives ("seamless", "powerful",
"easy", "blazing", "leverage", "unlock"). Lead with the noun. One sentence per
claim. No em dashes. Eighth-grade reading level.

## CI checks

These guards run in CI. All must pass before merge.

- `license` -- LICENSE file is MIT (`ci.yml`).
- `lint-skills` -- validates `SKILL.md` YAML frontmatter (required keys are
  present; it does NOT compare version values) (`ci.yml`).
- `check-versions` -- version coherence: `plugins/cloudgrid/.claude-plugin/plugin.json` is the
  single source of truth, and `VERSION`, `package.json`, `.codex-plugin/plugin.json`,
  and `.cursor-plugin/plugin.json` must mirror it exactly (`ci.yml`).
- `corpus-tool-names` -- edition-safety: only the 15 shared tool names may
  appear as bare `grid_*` tokens in corpus and skill prose (`ci.yml`). The
  allowlist must match the one in `cloudgrid-io/mcp`; `corpus-drift` checks it.
- `eval-content` -- behavioral content evals: yaml examples obey the platform
  contract; load-bearing teaching lines are present; banned patterns stay out
  (`ci.yml`).
- `template-python` -- installs each `semantic-search` Python service's
  pinned `requirements.txt` on Python 3.12, imports every module in its `app`
  package, and checks PDF text extraction against a golden output
  (`template-python.yml`). Runs only when those files change.
- `no-internal-refs` -- scans for leaked internal references (org names,
  partnership claims) (`internal-refs.yml`).
- `gitleaks` -- scans for committed secrets (`secret-scan.yml`).
- `corpus-drift` -- verifies the seven twinned corpus paths
  (`capability-map.md`, `cloudgrid-yaml.md`, `workflows/`, `templates/`,
  `examples/`, `rules/`, `troubleshooting/`) are byte-identical between this
  repo and `cloudgrid-io/mcp`, and that both repos' `corpus-tool-names`
  allowlists hold the same names (`corpus-drift.yml`). Other files the mcp
  snapshot renames (the `skill-*.md` and top-level docs) are not compared. Runs on **push to main**, a nightly cron, and
  `workflow_dispatch`, **not on PRs**, because corpus changes land as paired
  PRs and the first of a pair is legitimately ahead. A twinned edit that passes
  all PR checks can still turn main red after merge. Land twinned corpus edits
  as a coordinated pair across both repos.

Run the script-based guards locally:

```
node .github/scripts/lint-skills.mjs
node .github/scripts/check-versions.mjs
node .github/scripts/corpus-tool-names.mjs
npm install --no-save yaml && node .github/scripts/eval-content.mjs
node .github/scripts/no-internal-refs.mjs
```

## Template dependencies are user-facing

The pinned dependencies under `templates/` ship to builders. A builder who
starts from a template runs those exact pins on their own machine, in a repo
they now own. A broken pin does not break this repo's CI; it breaks their
first run. So the bar for a template dependency change is "a fresh builder can
install and run it", not "our checks are green".

For the `semantic-search` Python services, `template-python` is that check.
If its PDF golden output changes after a `pypdf` bump, do not just update the
hash: print the old and new text
(`.github/scripts/semantic-search-smoke.py <service-dir> --print`) and decide
whether the change is one builders should get. The extracted text is what the
template embeds, so a change there re-ranks search results.

## Releasing

Skills ship by **merging to main** -- the marketplace serves the repo directly.
Bump `plugins/cloudgrid/.claude-plugin/plugin.json` (PATCH by default), then mirror the same value
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

The skills use the `skills/<name>/SKILL.md` layout with YAML frontmatter, inside
the plugin folder `plugins/cloudgrid/`.

## Plugin directory checks

The plugin folder must pass the Claude plugin directory's checks:

```
claude plugin validate --profile directory --strict plugins/cloudgrid
```

Keep the plugin folder small (the directory holds plugins over 512 files for a
reviewer), keep every file the plugin needs inside it, and keep its README in
step with what the plugin runs, sends, and connects to.
