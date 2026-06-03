# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repo.

## What this repo is

`cloudgrid-io/skills` is CloudGrid's public extensibility surface: a set of
multi-agent skills, plus an MCP server, that let an AI agent drive CloudGrid
through the `cloudgrid` CLI. It installs into Claude Code, Codex, or Cursor.

This repo is public and Apache 2.0. Everything here is read by builders and by
other agents. Write accordingly.

## The thesis

Claude Code and Codex removed the wall around writing code. CloudGrid removes the
wall around shipping it — production and runtime. Together, anyone can build and
run a thing. These skills are how an agent crosses that second wall on a builder's
behalf. This phase is about adoption and identity. Everything is free.

## Scope

In this repo:

- One directory per skill, each with a `SKILL.md`.
- An MCP server (`mcp-server/`) that exposes the same actions as MCP tools.
- Marketplace manifests for Claude Code, Codex, and Cursor.
- Install and cookbook docs aimed at builders and at agents.

Not in this repo:

- The CLI source. The CLI ships separately as `@cloudgrid-io/cli`. Skills assume
  it is on `$PATH` and authenticated. Do not re-implement CLI behavior here.
- Platform code (API, manifests, infra). That lives elsewhere and is private.
- Any auth flow other than `cloudgrid login`.

## Voice

Every user-facing string — README, `SKILL.md` descriptions, error messages,
printed output — follows these rules:

- No emoji. No exclamation marks.
- No marketing adjectives ("seamless", "powerful", "easy", "blazing", "leverage",
  "unlock"). Plain, specific, confident.
- Lead with the noun. "Log tailing for an entity", not "Tail your logs!".
- One sentence per claim. If a claim needs three sentences, it may not be true.
- Eighth-grade reading level. Friction adds nothing.

Example:

- No: "Effortlessly deploy your apps with our powerful CLI!"
- Yes: "`cloudgrid plug` deploys a directory or URL. Live in about 30 seconds."

## Repo structure

```
.claude-plugin/      marketplace.json + plugin.json (Claude Code shape)
.codex-plugin/       plugin.json (Codex shape)
.cursor-plugin/      plugin.json (Cursor shape)
<skill-name>/        one directory per skill
  SKILL.md           YAML frontmatter + markdown body
  references/         optional supporting docs
mcp-server/          Node ESM MCP server, published as @cloudgrid-io/mcp
.github/             CI: license check + SKILL.md frontmatter linter
INSTALL.md           human install
INSTALL_FOR_AGENTS.md  install steps written for an agent to execute
COOKBOOK.md          canonical skill chains
README.md            front door
VERSION              canonical repo version
LICENSE              Apache 2.0
```

## How a skill works

Each `SKILL.md` carries YAML frontmatter (`version`, `name`, `description`,
`argument-hint`, `allowed-tools`) and a markdown body. The body always:

1. Bootstraps: install `@cloudgrid-io/cli` if missing, prompt `cloudgrid login`
   if not authenticated.
2. Wraps only the `cloudgrid` CLI. No direct API calls — with one sanctioned
   exception: the **anonymous drop** (`cloudgrid-drop` skill, `cloudgrid_drop` MCP
   tool) calls `POST /api/v2/drop/auto` directly. The anonymous path has no identity
   to manage, so the CLI adds nothing; calling it directly is what lets the drop work
   with nothing installed and nobody signed in. Do not "fix" it to use the CLI.
   Everything authenticated still wraps the CLI.
3. Detects the user's language from their first message and replies in it.
   Technical flags stay in English.
4. Prints results concisely — URLs and short summaries, never raw JSON or IDs.

Skill names start with `cloudgrid-`.

## Versioning

`VERSION` is canonical. Each `SKILL.md` `version:` tracks the repo version. Do not
version skills independently — it is over-engineering for now.

## Workflow

- Work on a branch, never directly on the default branch. Open a PR.
- CI must pass: license check and `SKILL.md` frontmatter linter.
- Before merging a skill, load it in a fresh session and run it against the
  deployed CLI. Evidence before claims.
- Verify no private references leak (no internal org names, no partnership claims).

## Do not

- Do not re-implement or fork the CLI. File an issue if it lacks something.
- Do not invent an auth flow. Use `cloudgrid login`.
- Do not add plan-gating, paywalls, or tier checks. Everything is free.
- Do not put partnership claims or internal org names in public docs.
- Do not skip the voice rules to save time.
