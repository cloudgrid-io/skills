---
version: 0.1.0
name: adding-databases
description: |
  Use when an app needs to store or persist data - "add a database", "save
  records", "store submissions", "persist state", "add a cache", "connect my
  Postgres / Supabase / Neon / Mongo". Wires managed data (or bring-your-own) into
  a CloudGrid app via the needs: block.
allowed-tools: Bash
---

# Adding databases

Declare data needs in `cloudgrid.yaml` and CloudGrid provisions the resource and
injects its connection string as an env var - no external service to manage.

## Managed (default)

- **Document DB (Mongo):** `needs: { database: true }` -> injects
  `DATABASE_MONGODB_URL` (plus the legacy `MONGODB_URL` alias).
- **Cache / KV / queue / pubsub (Redis):** `needs: { cache: true }` (or `kv` /
  `queue` / `pubsub`) -> `CACHE_REDIS_URL` (etc.).

## Bring-your-own (external)

If the user already has a database - Postgres, MySQL, Supabase, Neon,
PlanetScale, Firebase, Atlas - don't make them self-host:
`needs: { database: { tier: external, secret: MY_DB } }` plus
`grid secrets set MY_DB=<connection-string>`. The connection string lives in
write-only SECRETS, never committed.

## Rules

- **Read the injected env var LAZILY** (inside a getter/handler), never at module
  top level - a top-level read crashes startup before the grid injects it.
- Never hardcode a connection string or commit a secret.
- Managed relational Postgres/MySQL is bring-your-own only; the managed document
  store is Mongo. For semantic/vector search see `semantic-search`.
- Do NOT set the DB connection vars yourself - the grid injects them. Use
  `grid_secrets` only for your own external/BYO credentials.
