---
version: 0.2.2
name: using-cloudgrid
description: Use when the user asks to put an app, page, game, dashboard, or tool live at a public URL on CloudGrid, to give it a database, cache, disk, or AI model, or to change who can see an app on their grid. Explains what CloudGrid does and which route serves which request - the grid CLI for a project folder, the CloudGrid connector tools for content from the conversation and for account and grid actions.
---

# Using CloudGrid

CloudGrid runs the user's web apps at a live public URL and provides the
infrastructure they need: managed MongoDB, Redis (cache, queues, pub/sub),
pgvector, persistent disk, and an AI gateway that needs no API key. An app
declares what it needs in `cloudgrid.yaml`; the grid provisions it and injects
the connection details as env vars. "Plug" is the CloudGrid word for putting a
thing live on a grid.

## Which route serves which request

There are two ways to reach CloudGrid from Claude Code. Pick by where the work
lives.

| The request | Route |
|---|---|
| A project that is files on disk (a folder, even a few files you just wrote) | `grid` CLI: `grid plug <folder>` for a one-page site with `index.html` at the folder root; `grid plug` with no path, run inside the folder, for an app with a `cloudgrid.yaml` |
| Logs, secrets, env vars, local run, or downloading an app's source | `grid` CLI: `grid logs`, `grid secrets set`, `grid env set`, `grid dev`, `grid pull` |
| Content that is not saved anywhere, such as one HTML page written in chat | connector: `grid_plug` with `html` |
| Who can see an app (private, grid, link, public) | connector: `grid_visibility` |
| Add a collaborator | connector: `grid_collab` |
| List or create grids | connector: `grid_list_grids`, `grid_create_grid` |
| Did a runtime build come live | connector: `grid_check_deploy` (CLI: `grid status`) |
| Find a workflow, template, or reference doc | connector: `grid_start`, `grid_get_template` |
| Send the CloudGrid team a note or a bug report, with the user's consent | connector: `grid_note`, `grid_report` |

**The `grid` CLI.** Check for it with `grid --version`. If it is not installed,
show the user the install command and let them run it:

- macOS or Linux: `brew install cloudgrid-io/tap/grid`
- any platform: `npm install -g @cloudgrid-io/cli`

Do not install it for them and do not run it through a package launcher. If the
user does not want to install the CLI, a small text-only project can go inline
through `grid_plug` with `artifact_files`. If `grid` reports that it is below the
supported version, show the upgrade command (`brew upgrade grid` or
`npm install -g @cloudgrid-io/cli@latest`).

**Sign-in.** Creating anything needs a signed-in CloudGrid account. The connector
asks the user to sign in when a tool needs it. For the CLI, `grid whoami` checks
and `grid login` signs in through the browser; ask the user to finish the sign-in
and wait.

**What CloudGrid does not do.** It is not a shell, a container or VM host, or a
Kubernetes target; it does not deploy a git repository from a URL; it does not
run desktop or mobile apps. Say so plainly when asked.

## A substantial app: align first

Before building more than a single page, take one short step to align:

1. Confirm the idea in a sentence: what it does and who it is for.
2. Name the 3-5 core features.
3. Check for a template or workflow (`grid_start`, `grid_get_template`) before
   building from scratch.
4. Infer the data and runtime needs from the features and state them ("I'll add
   a database so entries are saved").

A single page (a landing page, a poster, a quick tool) skips this. The
`brainstorm` skill has the full flow; the `build` skill takes it live.

## The usual path

1. **Orient.** `grid_start` returns a short orientation and the workflow index.
2. **Match intent.** Map the request to a workflow in that index (for example,
   "build me a presentation" -> the `presentation` workflow).
3. **Load.** `grid_get_template(kind, name)` pulls the workflow, then the
   template it names, then optionally the closest example.
4. **Build.** Fill the template with the user's content.
5. **Test locally (runtime apps).** `grid dev` runs the app against real grid
   resources.
6. **Plug.** A one-page site on disk: `grid plug <folder>`. An app with a
   `cloudgrid.yaml`: `grid plug` with no path, from inside its folder. Content from the conversation:
   `grid_plug`. A runtime build is asynchronous; check `grid_check_deploy` (or
   `grid status`) until it reports success.
7. **Share.** Ask who should see it. A page plugged from a folder: pass it at
   plug time, `grid plug <folder> --visibility link`. An app plugged with the
   CLI: `grid visibility set <name> link`, using the full name `grid plug`
   printed (it may carry a suffix such as `-5139`). Content plugged with
   `grid_plug`: `grid_visibility`. Return the live URL.

## Notes

- Most builds are static inspirations: a single self-contained HTML file that
  plugs in seconds. The static archetypes: `landing-page`,
  `saas-marketing`, `docs-site`, `api-docs`, `status-page`, `changelog`,
  `portfolio`, `waitlist`, `web-app`, `dashboard`, `report`, and `presentation`.
  Match the request to one via its workflow `when:` (see `capability-map.md`).
- When an app needs persistence (a database or cache), declare it in
  `cloudgrid.yaml` with the canonical `needs:` shape, `needs: { database: true }`.
- **Existing data / bring-your-own database.** If the user already uses a database
  (Postgres, MySQL, MongoDB, Supabase, Neon, PlanetScale, Firebase, ...), CloudGrid
  supports both. Two shapes: **managed**:
  `needs: { database: true }` provisions Mongo and injects `DATABASE_MONGODB_URL`;
  **bring-your-own**: `needs: { database: { tier: external, secret: MY_DB } }` plus
  `grid secrets set MY_DB=<connection-string>` (the connection string lives in env
  SECRETS, never committed). Pick the shape from what they have, set the matching
  `needs:`/`services:`, and wire the secret. See `cloudgrid-yaml.md`.
  Persistent archetypes: `app-with-data` (a web UI), `api-service` (a plain
  Node/JSON backend API), and `ai-app` (a chatbot; adds `needs: { ai: true }`
  and calls the grid AI gateway via `@cloudgrid-io/runtime`). The DB-CRUD family
  (`crm`, `kanban`, `task-manager`, `admin-dashboard`, `invoice`, `inventory`,
  `job-board`, `ticket-system`) shares the `app-with-data` shape, differing only
  by domain schema + UI. All are runtime apps, plugged from a folder.
- The library spans several template families. Static (inspiration): a
  `product-launch` and `company-website` page alongside the other static
  archetypes. Runtime DB apps (`needs: { database: true }`):
  dashboards (`analytics-dashboard`, `monitoring-dashboard`, `financial-dashboard`,
  `revenue-dashboard`, `api-dashboard`), business/CRUD (`blog-cms`,
  `product-catalog`, `expense-tracker`, `time-tracking`, `directory`,
  `project-management`, `property-listings`), community (`event-board`,
  `feature-request-board`), education (`quiz-platform`), and vector search
  (`simple-semantic-search`: one node service on `needs: { vector: pgvector,
  ai: true }`, embeds a document and serves search-by-meaning; verified live).
  Match by the workflow
  `when:` in `capability-map.md`.
- **Blueprints** are heavier archetypes (`kind: blueprint`) that ship structure
  plus a correct `cloudgrid.yaml` plus an `AGENTS.md` guide, not fill-in-the-blanks
  app code. Fetch the template, read its `AGENTS.md` for the file tree,
  collections, and CloudGrid wiring (DB injection, a `vault:` block for auth /
  Stripe secrets, plug), then build the app under `services/web/`. Blueprints
  cover e-commerce (`online-store`, `marketplace`), operations
  (`internal-tools-portal`, `approval-workflow`, `hr-portal`, `erp`), community
  (`forum`), education (`course-platform`, `lms`), finance (`membership-site`,
  `subscription-management`, `billing-dashboard`), booking (`booking-system`,
  `calendar-scheduler`, `appointment-booking`, `restaurant-reservations`,
  `travel-booking`), and a RAG `ai-knowledge-base`. All are runtime apps, plugged
  from a folder. Scheduled `type: cron` services (Python and Node) work on CLI 0.14.0;
  the booking family's reminder cron and the semantic-search refresh cron are
  supported. The knowledge base's ideal `vector: pgvector` need is available
  (#1545 shipped; injects `VECTOR_PGVECTOR_URL`); the shipped blueprint still
  uses Mongo embeddings until it is updated to pgvector.
  See the `cloudgrid-yaml.md` reference for the full config schema, the `needs:`
  vocabulary, service types, and the environment variables the grid injects
  (`DATABASE_MONGODB_URL`, plus the legacy `MONGODB_URL` alias). The
  `capability-map.md` reference maps a user's intent to the workflow, plug
  path it needs.
- Every template ships its `cloudgrid.yaml` in the **full-annotated reference
  form** (`templates/_cloudgrid.yaml.reference`): every platform field is present
  as a comment, and only the archetype's needed fields (`name` + `services`, plus
  `needs:` for runtime apps) are uncommented. Comments are ignored by the parser,
  so the file plugs to exactly its active fields; the scaffold documents the
  whole schema inline without changing what plugs.
