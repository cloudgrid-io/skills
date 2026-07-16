---
version: 0.1.0
name: brainstorm
description: |
  You MUST use this before building any substantial app, game, tool, dashboard,
  or product - it explores the user's intent, goal, and core features before
  implementation, so you build the right thing. Use whenever the user wants to
  build, create, make, or plan something, or says "plan me...", "build me an
  app", "I have an idea", "turn this into a product", "help me think this
  through". Keep it lightweight and friendly; a simple single page can skip
  straight to building, and never ask a non-technical user technical questions.
allowed-tools: Bash
---

# Brainstorm

The user wants to build something, but the idea is fuzzy. Do not jump to
generating or deploying. Take one lightweight beat to align, then hand off to
the `build` skill.

Keep it human and short. Two or three plain questions at most. Offer options,
never demand specs.

## The beat

1. **Idea in a sentence.** "So this is a `<thing>` that lets `<who>` do `<what>`
   - right?" Confirm or adjust.
2. **Who it is for and the main goal.** One line. ("For your class, to collect
   RSVPs.")
3. **Core features.** The 3-5 things it must do. Suggest a starter set and let
   them trim.
4. **Complexity read (you decide, do not ask).** Is it a single static page, an
   interactive tool, or does it need to save data / accounts / AI? Infer this
   from the features.

## Rules

- Never ask about databases, runtimes, frameworks, or hosting. Infer them and
  state the plan in plain words ("I'll set it up so entries are saved").
- If the request is already clear and simple (a landing page, a poster, a quick
  calculator), skip brainstorming and go straight to the `build` skill.
- Do not over-scope. Land the smallest version that delivers the core goal; more
  can be added after it is live.
- End by summarizing the idea in 2-3 bullets and moving to build.

## What CloudGrid gives you (so you can build fast)

Once the features are clear you usually know what the app needs. CloudGrid
provisions infrastructure from a `needs:` block in `cloudgrid.yaml` and injects a
connection string as an env var - you don't run or host anything. Recognize the
need from the feature, declare one line, read the injected var (LAZILY, never at
module top level), and build:

| The app needs to... | Declare in cloudgrid.yaml | Injected env var |
|---|---|---|
| save data / accounts / multi-user state | `needs: { database: true }` (Mongo) | `DATABASE_MONGODB_URL` |
| cache / queue / pub-sub / key-value | `needs: { cache: true }` (or `kv`/`queue`/`pubsub`; Redis) | `CACHE_REDIS_URL` (etc.) |
| use an LLM (chatbot, summarize, generate) | `needs: { ai: true }` (managed gateway) | call via `@cloudgrid-io/runtime` - no API key |
| run on a schedule | a `type: cron` service | - |
| semantic search / embeddings (search my docs by meaning) | `needs: { vector: pgvector }` (template: `simple-semantic-search`) | `VECTOR_PGVECTOR_URL` |
| durable files on disk | `needs: { disk: true }` | `DISK_PATH` |
| use an existing DB (Postgres/Supabase/Neon/Atlas) | `needs: { database: { tier: external, secret: MY_DB } }` + `grid secrets set MY_DB=...` | your `MY_DB` |

Rules that keep it fast and correct: never hardcode a connection string or commit
a secret (the platform injects them); read injected vars lazily inside a
getter/handler. Managed relational Postgres/MySQL is bring-your-own only.

The deploy shape follows from the needs: **no `needs:` and one self-contained
HTML file -> an instant static page (any edition); any `needs:` or multiple files
-> a runtime app** (built + deployed, local edition, async). Golden path:
`grid_start` -> `grid_get_template` -> fill -> `grid_deploy` -> `grid_set_sharing`.

So for "build me a system / an app that saves X", infer `needs: { database: true }`
up front and go straight from the brainstorm to a working build.

Next: the `build` skill - structure the project, deploy, and return the live URL.
