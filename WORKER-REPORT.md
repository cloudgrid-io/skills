# Worker Report: multi-service template

## Branch / status

- **pwd:** `/private/tmp/claude-501/-Users-michal-cloudgrid-v2/479905ff-af33-4e8c-855c-8fa474a338be/scratchpad/wt-msvc-tpl`
- **Branch:** `feat/multi-service-template`
- **HEAD:** (will be set after commit)

## Diff stat

```
.claude-plugin/plugin.json                          |   2 +-
capability-map.md                                   |  10 +++++-----
skills/build/SKILL.md                               |   6 +++---
templates/multi-service/cloudgrid.yaml              | new (full-annotated reference form)
templates/multi-service/index.md                    | new
templates/multi-service/README.md                   | new
templates/multi-service/services/web/index.html     | new
templates/multi-service/services/api/package.json   | new
templates/multi-service/services/api/src/index.js   | new
workflows/multi-service.md                          | new
```

## The empirical answer: /api prefix behavior

**The platform forwards requests with the path prefix INTACT.**

When `api` is mounted at `path: /api` in `cloudgrid.yaml`, a browser request to
`/api/items` arrives at the Node server as `req.path = "/api/items"` — the
`/api` prefix is NOT stripped. Express routes must include the prefix:
`app.get("/api/items", ...)`.

### Evidence

The diagnostic 404 handler echoes the received path:

```
GET /api/nonexistent  ->  {"path":"/api/nonexistent","method":"GET","message":"not found"}
```

Routes registered at `/api/items` (with prefix) return 200. A route registered
at just `/items` (without prefix) would never match because the incoming path
is `/api/items`.

The frontend fetches from `/api/items` (absolute path, no hostname) and the
platform routes by prefix to the correct service.

## Deploy transcript

### 1. Deploy

```
$ cd /tmp/msvc-test && npx -y @cloudgrid-io/cli@latest plug --grid michal-tests --no-progress
Note: 'my-app' was taken in michal-tests-hub; using 'my-app-1f07'.
Adopting my-app-1f07 (app) in michal-tests-hub from the existing cloudgrid.yaml...
  Kept cloudgrid.yaml (unchanged)
  Linked .cloudgrid/link.json
  Charged. Plugging now...
Plugging my-app into michal-tests-hub...
```

### 2. Status polling (building -> live)

```
$ npx -y @cloudgrid-io/cli@latest info
my-app  (app)
  Org:         michal-tests
  Last deploy: building  4m ago
  URL:         https://my-app-1f07--michal-tests.cloudgrid.io

  ...

  Last deploy: live  5s ago
  URL:         https://my-app-1f07--michal-tests.cloudgrid.io
```

### 3. Frontend loads

```
$ curl -s -o /dev/null -w "HTTP %{http_code}" https://my-app-1f07--michal-tests.cloudgrid.io/
HTTP 200
```

(After setting visibility to `link` — default `grid` visibility returns 403.)

### 4. API responds

```
$ curl -s https://my-app-1f07--michal-tests.cloudgrid.io/api/items
[]
--- HTTP 200 ---

$ curl -s https://my-app-1f07--michal-tests.cloudgrid.io/api/health
{"status":"ok"}
--- HTTP 200 ---
```

### 5. Write/read round-trip

```
$ curl -s -X POST -H "Content-Type: application/json" \
  -d '{"text":"hello from the deploy test"}' \
  https://my-app-1f07--michal-tests.cloudgrid.io/api/items
{"id":"6a6605dfc22113e984a41e48","text":"hello from the deploy test"}
--- HTTP 201 ---

$ curl -s https://my-app-1f07--michal-tests.cloudgrid.io/api/items
[{"id":"6a6605dfc22113e984a41e48","text":"hello from the deploy test"}]
--- HTTP 200 ---

$ curl -s -X POST -H "Content-Type: application/json" \
  -d '{"text":"second note"}' \
  https://my-app-1f07--michal-tests.cloudgrid.io/api/items
{"id":"6a6605e0c22113e984a41e49","text":"second note"}
--- HTTP 201 ---

$ curl -s https://my-app-1f07--michal-tests.cloudgrid.io/api/items
[{"id":"6a6605e0c22113e984a41e49","text":"second note"},{"id":"6a6605dfc22113e984a41e48","text":"hello from the deploy test"}]
--- HTTP 200 ---

$ curl -s -X DELETE https://my-app-1f07--michal-tests.cloudgrid.io/api/items/6a6605dfc22113e984a41e48
{"ok":true}
--- HTTP 200 ---

$ curl -s https://my-app-1f07--michal-tests.cloudgrid.io/api/items
[{"id":"6a6605e0c22113e984a41e49","text":"second note"}]
--- HTTP 200 ---
```

### 6. Teardown

```
$ npx -y @cloudgrid-io/cli@latest unplug --hard my-app-1f07 --skip-confirm
x my-app-1f07 unplugged. Archived. K8s teardown running in the background.
  Trace: d_ms1t8pco_68d570

$ curl -s -o /dev/null -w "HTTP %{http_code}" https://my-app-1f07--michal-tests.cloudgrid.io/
HTTP 404
```

Entity confirmed gone.

## Lint outputs

```
$ node .github/scripts/lint-skills.mjs
ok   skills/brainstorm/SKILL.md
ok   skills/build/SKILL.md
ok   skills/sites/SKILL.md
All 3 SKILL.md file(s) passed.

$ node .github/scripts/no-internal-refs.mjs
No internal references found.
```

## Files created

| File | Purpose |
|------|---------|
| `templates/multi-service/cloudgrid.yaml` | Full-annotated reference form; active: name, services(web static + api node), depends_on, needs |
| `templates/multi-service/index.md` | Template reference with key rules (proven by deploy) |
| `templates/multi-service/README.md` | Short description |
| `templates/multi-service/services/web/index.html` | Static frontend — fetches /api/items |
| `templates/multi-service/services/api/package.json` | Express + mongodb deps |
| `templates/multi-service/services/api/src/index.js` | Express CRUD server with lazy Mongo |
| `workflows/multi-service.md` | Workflow with frontmatter + recipe |

## Files modified

| File | Change |
|------|--------|
| `skills/build/SKILL.md` | Replaced "no dedicated multi-service template" with pointer to `multi-service` |
| `capability-map.md` | Updated multi-service row to point at `multi-service` template; updated "How to choose" bullet; updated template count 61 -> 62 |
| `.claude-plugin/plugin.json` | PATCH bump 0.14.30 -> 0.14.31 |

## Judgment calls

1. **Static frontend (no build step):** chose plain HTML + inline JS for the
   `web` service rather than React/Vite. This keeps the template trivially
   correct — no `build:` step needed, no node_modules, deploys without any
   build failure risk. The "Adapt it" section tells users how to swap in a
   Vite/React frontend.

2. **Express routes include `/api` prefix:** based on the empirical finding that
   the platform does NOT strip the path prefix, all Express routes are defined
   with the `/api` prefix (e.g., `app.get("/api/items", ...)`). This is the
   single most important discovery for agents building multi-service apps.

3. **Diagnostic 404 handler kept:** the catch-all handler that echoes the
   received path serves as a debugging aid for agents. It lets them verify
   prefix behavior without reading the template docs.

4. **`depends_on: [api]` on web:** ensures the API service is ready before the
   static frontend starts serving. Without this, a browser could load the page
   and fetch `/api/items` before the API is up.

5. **"Notes" app, not "Todos":** chose a different domain name to avoid
   confusion with the `app-with-data` template which uses "Todos".
