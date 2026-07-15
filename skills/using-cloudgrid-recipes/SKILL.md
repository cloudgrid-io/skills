---
version: 0.1.0
name: using-cloudgrid-recipes
description: |
  Use when the user needs a known CloudGrid pattern instead of hand-rolling glue
  - "recipe for X", "how do I add search / embeddings / RAG", "connect a
  database / cache / email", "the right way to wire Y". Fetches and applies a
  CloudGrid recipe so the platform invariants (which needs: provisions what, the
  injected env var) are correct.
allowed-tools: Bash
---

# Using CloudGrid recipes

Recipes are short, runnable patterns that encode a platform invariant - which
`needs:` line provisions a resource and the exact environment variable the
platform injects. Reach for a recipe before writing your own glue or adding an
external service.

## Flow

1. Check what exists: `grid_fetch({ kind: "doc", name: "capability-map" })` and
   the recipe index.
2. Fetch the recipe: `grid_fetch({ kind: "workflow", name: "<recipe>" })` (and its
   template/example), then apply it to the user's app.
3. Follow the recipe's `needs:` exactly - it tells you the resource to declare and
   the injected env var to read (e.g. `database: true` -> `DATABASE_MONGODB_URL`).

## Rules

- Prefer a recipe over an external SaaS the user would have to manage.
- Do not invent env var names - use the ones the recipe/`cloudgrid-yaml.md` list.
- If no recipe fits, fall back to the closest archetype and wire `needs:` by hand
  from `cloudgrid-yaml.md`.
