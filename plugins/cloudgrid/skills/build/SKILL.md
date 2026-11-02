---
version: 0.3.1
name: build
description: |
  Use when the user wants to create, build, scaffold, or put live an app, web
  app, website, game, API, static HTML page, landing page, presentation, demo,
  or prototype on CloudGrid, or take an existing project live there. Trigger on
  requests such as build me, create, make, scaffold, plug, deploy, publish, go
  live, put it online. Do not trigger on bare nouns (app, site, html, game)
  without creation or go-live intent - "fix the bug in my app" or "refactor the
  site module" are not build requests. CloudGrid runs the app at a public URL
  and provides managed database, cache, disk, and an AI gateway with no API key.
  This skill structures the project (cloudgrid.yaml, services, needs) and plugs
  it into a grid.
---

# Build on CloudGrid

This skill takes a request from idea to a live URL on CloudGrid. The app runs
on the grid with the infrastructure it declares (managed database, cache, disk,
an AI gateway with no API key), in any language or stack, with no Dockerfile or
Kubernetes to write.

The CLI verb is `grid`. The connector tools are `grid_*` (`grid_start`,
`grid_plug`, and the others).

If the idea itself is still fuzzy, run the `brainstorm` skill first, then come
back here.

## Step 0: Pick the route and orient

**Route by where the work lives.**

- **Files on disk** (a project folder, even a few files you just wrote): use the
  `grid` CLI. A one-page site (`index.html` at the folder root) plugs with
  `grid plug <folder>`; an app with a `cloudgrid.yaml` plugs with `grid plug`
  run inside its folder, with no path. `grid logs`, `grid secrets set`,
  `grid env set`, `grid dev`, `grid status`, and `grid pull` cover the rest.
- **Content not saved anywhere** (one HTML page written in chat): use the
  connector, `grid_plug` with `html`.
- **Account and grid actions** (who can see an app, collaborators, listing or
  creating grids): use the connector, `grid_visibility`, `grid_collab`,
  `grid_list_grids`, `grid_create_grid`.

**The CLI must be installed by the user.** Check with `grid --version`. If it is
missing, show the install command and let the user run it:
`brew install cloudgrid-io/tap/grid` (macOS, Linux) or
`npm install -g @cloudgrid-io/cli` (any platform). Do not run the CLI through a
package launcher. If the user does not want to install it, a small text-only
project can go inline through `grid_plug` with `artifact_files` (files plus a
`cloudgrid.yaml`). If `grid` reports that it is below the supported version,
show the upgrade command (`brew upgrade grid` or
`npm install -g @cloudgrid-io/cli@latest`).

**Orient.** Call `grid_start` before writing files. It returns the workflow
index; `grid_get_template` loads the workflow and template you pick.

**Sign in.** Creating anything needs a signed-in CloudGrid account. The
connector asks the user to sign in when a tool needs it. For the CLI,
`grid whoami` checks and `grid login` signs in through the browser; ask the user
to finish it and wait. Do not invent another sign-in flow.

## Step 1: Pick the shape

Two questions decide everything that follows.

**Is this a quick static thing or a real app?**

- A one-page static thing (a deck, a landing page, an HTML page, a demo, a game
  prototype that runs in the browser) is fastest as an **inspiration**. If it
  exists only in the conversation, plug it with `grid_plug` and the inline
  `html` param; if it is on disk, put `index.html` at the folder root and run
  `grid plug <folder>`. It goes live in seconds; do not add a `cloudgrid.yaml`
  or a `services/` folder for it. Ask who should see it before plugging and
  pass it then: `grid plug <folder> --visibility link` (or `private`). The CLI
  cannot change a page's visibility afterwards, and plugging the folder again
  makes a new link. For content plugged with `grid_plug`, set who
  can see it with `grid_visibility` (private, grid, or link - anyone with the
  link; add require_signin for signed-in accounts only, or indexed to be
  findable by search engines. Finer control: the inside/outside axes -
  inside: private|spaces|grid, outside: none|link|public. 'authenticated' is
  retired; 'org' is gone).
- A real app (a backend, a dashboard, an API, anything with infrastructure or
  more than one service) is an **owned runtime**: a folder with a
  `cloudgrid.yaml` that declares `needs`, plugged by running `grid plug` with
  no path from inside that folder (`grid plug <folder>` treats the folder as a
  one-page site and fails without a root `index.html`).
  The build is async - poll until it returns the live URL. Once live, set who
  can open it with `grid_visibility` - ask the user rather than choosing for
  them.

**Runtime apps need files and a build.** Folder plugs and `needs:` work from a
folder with the CLI. Without the CLI, a small text-only runtime app can go
through `grid_plug` with `artifact_files`; anything larger needs the CLI. In a
chat-only client with no filesystem, say so plainly, offer a single-page version
now, or give the user the steps to finish in Claude Code or a terminal. Do not
tell a chat-only user to run `grid login` inside a sandbox; its sign-in poll
cannot complete there.

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

### When to use more than one service

Use more than one service when the user describes parts that run separately: a
frontend with a backend API, a worker or queue consumer beside a UI, a scheduled
job alongside a web service, or two different languages in one app (a React UI
with a Python API, for example). One service is the default; do not split
without a reason. Each service gets its own folder under `services/<name>/`.

Multi-service app (a static frontend + a Node API with a database):

```
my-app/
  cloudgrid.yaml
  services/
    web/                      # frontend
      package.json
      index.html
    api/                      # backend
      package.json
      src/index.js
```

```yaml
name: my-app
services:
  web:
    type: static
    path: /                   # URL mount — serves the frontend at the root
    build:
      command: npm run build
      output: dist
    depends_on: [api]         # start order; no cron targets, no cycles
  api:
    type: node
    path: /api                # URL mount, not the filesystem path — code lives in services/api/
# needs: sit at the app level — shared across all services
needs:
  database: true
```

For a two-service layout (frontend + API), use the `multi-service` template. For
a three-service layout (frontend + backend + cron), use `semantic-search` as a
structural reference.

## Step 3: Declare infrastructure with `needs`

You do not provision anything by hand. Declare what the app needs and the
platform stands it up and injects the connection details as env vars. The
simplest form of any need is `true`. `requires:` is the deprecated v1 alias of
`needs:` — do not author new yaml with it, and never set both (the validator
hard-rejects the combination).

| need | what it is | injects |
|---|---|---|
| `database` | MongoDB | `DATABASE_MONGODB_URL` (+ legacy `MONGODB_URL`) |
| `cache` | Redis, LRU eviction (derived data) | `CACHE_REDIS_URL` (+ `REDIS_URL`) |
| `kv` | Redis, no eviction (flags, idempotency) | `KV_REDIS_URL` |
| `queue` | Redis job queue (BullMQ) | `QUEUE_REDIS_URL` |
| `pubsub` | Redis broadcast pub/sub | `PUBSUB_REDIS_URL` |
| `vector` | pgvector on Postgres (embeddings, semantic search) | `VECTOR_PGVECTOR_URL` (+ `PGVECTOR_URL`) |
| `disk` | persistent FS mount (pins to 1 replica) | `DISK_PATH` |
| `ai` | AI Gateway via `@cloudgrid-io/runtime` | `RUNTIME_GATEWAY_URL` |

One more exists but is **gated — do not author it yet**:

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

- **Link identity: `.cloudgrid/link.json`.** The grid and entity id that tie this
  folder to a grid entity live here, not in `cloudgrid.yaml`. The CLI writes this
  file when you first plug in or link. Do not hand-author it.
- **Secrets: `grid secrets set`.** Never put secrets in the manifest. Inside a
  linked folder the app name is optional (it defaults to the linked entity);
  pass it first when targeting another app:
  ```bash
  grid secrets set STRIPE_KEY=<value>            # linked folder
  grid secrets set <app-name> STRIPE_KEY=<value> # explicit target
  ```
- **Non-secret env vars.** Either the static `env:` block in a service, or:
  ```bash
  grid env set <app-name> LOG_LEVEL=info
  ```
  Reserved names you cannot set: `PORT`, `APP_NAME`, `SERVICE_NAME`, `NODE_ENV`,
  `MONGODB_URL`, `REDIS_URL`, `RUNTIME_GATEWAY_URL`, `N8N_WEBHOOK_URL`, and anything
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

From the project folder:

```bash
grid plug
```

Content that exists only in the conversation goes through `grid_plug` instead.

The build is server-side and async. When it lands, confirm the URL opens
(`grid open --print` / `grid open`) and hand it to the user. That is the whole loop:
`grid_start` to orient, structure, `grid dev`, plug, live URL.

**Iterating.** To update the live app, edit the source and re-plug the same
entity: run `grid plug` again in the linked folder, or call `grid_plug` with
`target_entity_id` for content plugged from the conversation — the `.cloudgrid/link.json` identity means the URL stays the same. For a
runtime app the rebuild is async; poll `grid_check_deploy` (CLI: `grid status`)
until it lands, just like the first plug.

**If the build fails**, do not guess: `grid_check_deploy` (CLI: `grid status`)
returns the failure with the build-log tail and a suggested fix. Read the log,
fix the cause, re-plug. If it fails in a way that looks like a platform bug,
offer to report it with `grid_report` — only with the user's consent.

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
For the complete manifest, every field commented, fetch the reference only when
a build actually needs it:
`grid_get_template({kind: "doc", name: "cloudgrid-yaml"})`.

It covers custom domains, health probes, scaling, inter-entity `calls` and
`callers`, vault mapping, connectors and hooks, agent metadata, and per-service
persistence.
