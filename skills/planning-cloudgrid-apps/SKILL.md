---
version: 0.1.0
name: planning-cloudgrid-apps
description: |
  Use after the idea is clear to turn it into a short CloudGrid build plan -
  "plan an app", "what do I need to build X", "spec this out". Picks whether a
  template or recipe fits, the runtime and data needs, and the build steps, then
  hands off to building. Keeps the plan lightweight and non-technical-friendly.
allowed-tools: Bash
---

# Planning CloudGrid apps

Turn a locked idea (see `brainstorming-app-ideas`) into a short plan the user can
okay in a glance. A plan is a few bullets, not a document.

## Produce this plan

1. **Features** - the 3-5 core things, in the user's words.
2. **Template or recipe?** - check `grid_start` and `capability-map.md` for a
   matching archetype (`choosing-cloudgrid-templates`) or a recipe
   (`using-cloudgrid-recipes`) before building from scratch.
3. **Runtime + data** - decide from the features, do not ask:
   - Static, no saved data -> a single self-contained HTML page (inspiration,
     instant, any edition).
   - Saves data / accounts / multi-user -> a runtime app with
     `needs: { database: true }` (local edition, async deploy).
   - Needs an LLM -> add `needs: { ai: true }`.
   - Scheduled work -> a `type: cron` service.
4. **Edition** - single page works anywhere; a multi-file build needs the local
   edition (Claude Desktop/Code) or the CLI.
5. **Steps** - scaffold -> build -> validate -> deploy -> share.

## Rules

- State infra choices in plain language and move on ("saves data, so I'll add a
  database"). Do not quiz the user.
- Prefer a template/recipe over hand-rolling.
- Keep the plan to a handful of bullets and confirm in one line before building.
- Managed data available today: Mongo (`needs: { database: true }`), Redis
  (`cache`/`kv`/`queue`/`pubsub`), and **pgvector for semantic/vector search**
  (`needs: { vector: pgvector }`). Relational Postgres/MySQL is bring-your-own
  (external secret). Do not claim capabilities CloudGrid lacks (e.g. object
  storage is not available yet; no native mobile/desktop apps).

Next: build it (`building-cloudgrid-apps` or an archetype skill like
`building-games` / `creating-landing-pages`), then deploy and return the live URL.
