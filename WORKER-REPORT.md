# Worker Report: Multi-service guidance

## Context

- **Working directory:** `/private/tmp/claude-501/-Users-michal-cloudgrid-v2/479905ff-af33-4e8c-855c-8fa474a338be/scratchpad/wt-multisvc`
- **Branch:** `feat/multi-service-guidance`
- **Base:** `main` at `8362723`
- **Status:** all changes staged and committed (see below)

## `git diff --stat`

```
.claude-plugin/plugin.json   |  2 +-
capability-map.md            |  7 ++++++-
skills/build/SKILL.md        | 45 +++++++++++++++++++++++++++++++++++++++++++++
3 files changed, 52 insertions(+), 2 deletions(-)
```

## Text added to `skills/build/SKILL.md` (after the "Minimal app" example, before Step 3)

```markdown
### When to use more than one service

Use more than one service when the user describes parts that run separately: a
frontend with a backend API, a worker or queue consumer beside a UI, a scheduled
job alongside a web service, or two different languages in one app (a React UI
with a Python API, for example). One service is the default; do not split
without a reason. Each service gets its own folder under `services/<name>/`.

Multi-service app (a static frontend + a Node API with a database):

\```
my-app/
  cloudgrid.yaml
  services/
    web/                      # frontend
      package.json
      index.html
    api/                      # backend
      package.json
      src/index.js
\```

\```yaml
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
\```

There is no dedicated multi-service template. Start from `app-with-data` and add
a second service, or use the `semantic-search` template (which ships `web` +
`backend` + `refresh` cron) as a structural reference.
```

## Text added to `capability-map.md`

### New row in the main template table (after `semantic-search`)

```
| frontend plus a separate backend/API, two languages in one app (e.g. React + Python), a UI with a worker or scheduled job — any request where the parts run separately | no dedicated template — start from `app-with-data` and add a second service; structural reference: `semantic-search` (ships `web` + `backend` + `refresh` cron) | varies (at minimum `database: true` for persistent apps) | runtime (async, poll) | local |
```

### New bullet in "How to choose" (item 4)

```
4. More than one service when the user describes parts that run separately — a
   frontend with a backend API, a worker, a scheduled job, or two different
   languages. One service is the default; do not split without a reason. There
   is no dedicated multi-service template; start from `app-with-data` and add a
   second service, or use `semantic-search` as a structural reference.
```

## Lint outputs

- `node .github/scripts/lint-skills.mjs` — **passed** (all 3 SKILL.md files OK)
- `node .github/scripts/no-internal-refs.mjs` — **passed** (no internal references found)
- `node .github/scripts/corpus-drift.mjs` — **2 drifts** (expected):
  - `capability-map.md` — my change; needs mirroring to `cloudgrid-io/mcp` repo
  - `workflows/ai-app.md` — pre-existing drift (not related to this PR)

## YAML verification against `cloudgrid-yaml.md`

Every field in the two-service example exists in `cloudgrid-yaml.md`:

| Field | Reference |
|---|---|
| `services.web.type: static` | valid service type (section 4) |
| `services.web.path: /` | valid URL mount (section 4, path) |
| `services.web.build.command` | valid for static (section 4, build) |
| `services.web.build.output` | valid for static (section 4, build) |
| `services.web.depends_on: [api]` | valid — applies to all except cron (section 4) |
| `services.api.type: node` | valid service type (section 4) |
| `services.api.path: /api` | valid URL prefix (section 4, path) |
| `needs.database: true` | valid app-level need (section 5) |

Folder tree `services/web/` and `services/api/` match the service keys.

## Judgment calls

- **App-level vs per-service `needs:`:** `cloudgrid-yaml.md` supports both. App-level
  `needs:` is shared across all services; per-service `needs:` merges per-key (overrides
  or extends). The example uses app-level `needs:` as the default/recommended form, which
  matches all existing templates (including `semantic-search`). The build skill already
  documents both forms in Step 3.
- **`depends_on: [api]` on `web`:** ensures the API is ready before the frontend starts
  serving. For a static service this is cosmetic (nginx serves files regardless), but it
  teaches the correct pattern for agents building nextjs + api combos where the ordering
  matters.
- **No new template claimed:** the capability-map row honestly states "no dedicated
  template" and points to `app-with-data` + `semantic-search` as starting points.
