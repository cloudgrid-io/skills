---
version: 0.1.0
name: build
description: |
  You MUST use this before any building, deploying, or code work - creating an
  app, a web app, a website, a game, an API, a static HTML page, a landing page,
  a presentation, a deck, a demo, or any prototype. Trigger on build, make,
  create, scaffold, prototype, deploy, ship, app, game, site, html, or
  presentation. Structures the project (cloudgrid.yaml, services, needs) and
  takes it live on the grid with a public URL.
allowed-tools: Bash
---

# Build on CloudGrid

Every buildable request ends the same way: a working thing that is plugged in and
live on the grid, with a public URL. Not a folder of files on someone's laptop.
This skill is the path from idea to live.

The CLI verb is `grid` — only. The MCP tools are `grid_*` (`grid_start`,
`grid_deploy`, and friends). Prefer the MCP tools when they are connected; the
CLI commands below are the fallback and take the same arguments.

If the idea itself is still fuzzy, run the `brainstorm` skill first, then come
back here.

## Step 0: Orient with grid_start

Before writing any code or any files, call the `grid_start` tool. It sets up the
context for what you are about to build. Do this first, every time, even for a
single HTML page.

If the CloudGrid MCP is not connected, say so plainly, ask the user to connect
it, then continue with the CLI steps below.

## Step 1: Pick the shape

Two questions decide everything that follows.

**Is this a quick static thing or a real app?**

- A one-page static thing (a deck, a landing page, an HTML page, a demo, a game
  prototype that runs in the browser) is fastest to ship as an **inspiration**:
  deploy it with `grid_deploy` and the inline `html` param for an instant public
  URL — works on any edition. Set who can see it with `grid_set_sharing`
  (private, space, authenticated, org).
- A real app (a backend, a dashboard, an API, anything with infrastructure or
  more than one service) is an **owned runtime**: a `cloudgrid.yaml` with
  `needs`, deployed with `grid_deploy` on a linked folder (CLI: `grid plug`).
  The build is async — poll until it returns the live URL.

**What service type is it?** One of: `node`, `nextjs`, `python`, `static`, `cron`.

| You are building | type |
|---|---|
| static page, deck, HTML, browser game | `static` |
| dashboard, full-stack React | `nextjs` |
| API, worker, bot, backend | `node` or `python` |
| scheduled job | `cron` |

## Step 2: Structure the project

Code lives under `services/<name>/`, where `<name>` matches the service key in
`cloudgrid.yaml`. Only two fields are required in the manifest: `name` and
`services`.

Minimal static (a deck or HTML page):

```
my-thing/
  cloudgrid.yaml
  services/
    web/
      index.html          # static: index.html at the service ROOT, not in public/
```

```yaml
name: my-thing
services:
  web:
    type: static
    path: /
```

Minimal app (a node API that needs a database):

```
my-api/
  cloudgrid.yaml
  services/
    web/
      package.json
      index.js            # listen on process.env.PORT
```

```yaml
name: my-api
services:
  web:
    type: node
    path: /
needs:
  database: true
```

## Step 3: Declare infrastructure with `needs`

You do not provision anything by hand. Declare what the app needs and the
platform stands it up and injects the connection details as env vars. The
simplest form of any need is `true`.

| need | what it is | injects |
|---|---|---|
| `database` | MongoDB | `DATABASE_MONGODB_URL` (+ legacy `MONGODB_URL`) |
| `cache` | Redis, LRU eviction (derived data) | `CACHE_REDIS_URL` (+ `REDIS_URL`) |
| `kv` | Redis, no eviction (flags, idempotency) | `KV_REDIS_URL` |
| `queue` | Redis job queue (BullMQ) | `QUEUE_REDIS_URL` |
| `pubsub` | Redis broadcast pub/sub | `PUBSUB_REDIS_URL` |
| `disk` | persistent FS mount (pins to 1 replica) | `DISK_PATH` |
| `ai` | AI Gateway via `@cloudgrid-io/runtime` | `AI_GATEWAY_URL` |

Two more exist but are **gated — do not author them yet**:

- `vector` (pgvector) — deploy stalls (platform #1545). Store embeddings in
  Mongo and cosine-rank in the app for now.
- `object_storage` (GCS) — rejected at plug-time (#1678). Use `disk` or a
  bring-your-own bucket via a secret.

```yaml
needs:
  database: true
  cache: true
  ai: true
```

`needs` can sit at the app level (shared) or inside a single service to scope it
there. A per-service `needs` merges with the app-level one. Read every injected
var LAZILY (inside a getter or handler, never at module top level).

## Step 4: Config that does NOT go in cloudgrid.yaml

Three things live outside the manifest. Teaching this saves the most confusion.

- **Link identity: `.cloudgrid/link.json`.** The org and entity id that tie this
  folder to a grid entity live here, not in `cloudgrid.yaml`. The CLI writes this
  file when you first plug in or link. Do not hand-author it.
- **Secrets: `grid secrets set`.** Never put secrets in the manifest. Set them
  with the app name first, then the pair:
  ```bash
  grid secrets set <app-name> STRIPE_KEY=<value>
  ```
- **Non-secret env vars.** Either the static `env:` block in a service, or:
  ```bash
  grid env set <app-name> LOG_LEVEL=info
  ```
  Reserved names you cannot set: `PORT`, `APP_NAME`, `SERVICE_NAME`, `NODE_ENV`,
  `MONGODB_URL`, `REDIS_URL`, `AI_GATEWAY_URL`, `N8N_WEBHOOK_URL`, and anything
  starting with `CLOUDGRID_`.
- **No Dockerfile.** Do not write one. The platform generates the container from
  the service `type`.

## Step 5: Run it locally

```bash
grid dev
```

This runs the app against real grid resources. Confirm it works before you take
it live.

## Step 6: Take it live

MCP: `grid_deploy` on the linked folder, then poll until it returns the live
URL. CLI:

```bash
grid plug
```

The build is server-side and async. When it lands, confirm the URL opens
(`grid_get_url` / `grid open`) and hand it to the user. That is the whole loop:
`grid_start` to orient, structure, `grid dev`, deploy, live URL.

## Rules and gotchas

- `name`: 2 to 42 chars, lowercase a-z, 0-9, and hyphens; starts and ends with a
  letter or digit. It becomes part of the app's public `cloudgrid.io` URL.
- One service per entity can claim `path: /`. Others use `/api` or `false`
  (internal). Omitting `path` means internal and warns.
- `node`, `nextjs`, `python` services must listen on `process.env.PORT` (default
  8080).
- `nextjs`: set `output: 'standalone'` in `next.config.mjs`.
- `static`: put `index.html` at the service root. A build step is optional
  (`build.command` + `build.output`).
- `cron`: `schedule` is required; set `timezone` and `run` (a `job` or an https
  URL).
- `depends_on` orders sibling services; no cron, no cycles.

## Full field reference

The two required fields are `name` and `services`. Everything else is optional.
For the complete manifest, every field commented, read the reference file beside
this skill only when a build actually needs it:

`reference/cloudgrid.yaml.example`

It covers custom domains, health probes, scaling, inter-entity `calls` and
`callers`, vault mapping, connectors and hooks, agent metadata, and per-service
persistence.
