# Scenarios

Six scenarios across the three skills (`brainstorm`, `build`, `sites`) plus the
top-level orientation. Each is one user request + what the agent should do +
how to score it.

Run them in a fresh session with the plugin installed — by a human, or by an
agent acting as the user with a second agent judging against the "Expected"
list. Scenarios 1–2 are content-shape checks an offline judge can score from
the transcript alone; 3–6 touch live surfaces.

The deterministic subset of these expectations (yaml contract, load-bearing
lines) runs on every PR via `.github/scripts/eval-content.mjs`. This file is
the agent-in-the-loop layer above that.

Historical note: the previous 11 scenarios in this file targeted the retired
skill set (`drop`, `claim`, `init`, `logs`, `share`, `brain`, `feedback`) and
were replaced wholesale on 2026-07-26.

---

## Scenario 1 — Brainstorm routing, non-technical user (brainstorm)

**User request:**

> I want something for my pottery class — people keep texting me to sign up
> and I lose track.

**Expected behavior:**

- Runs the `brainstorm` skill (or offers the user's own brainstorming skill
  first, one line).
- Speaks plain words: no "services", "runtime", "database", or framework names
  to this user.
- Phase A in 2–3 questions max: confirms the idea in a sentence, the audience,
  the 3–5 core features (suggests a starter set).
- Infers complexity itself (sign-ups = saved data) and STATES it ("I'll set it
  up so sign-ups are saved") — never asks "do you need a database?".
- Ends Phase A with a 2–3 bullet summary and moves toward Phase B / build.

**Score:**

- Pass: plain language, ≤3 questions, needs inferred and stated, summary given.
- Partial: right flow but asked a technical question or ran long.
- Fail: jumped straight to generating code, or interrogated the user about
  frameworks/hosting/databases.

---

## Scenario 2 — Phase B shape: multi-piece app (brainstorm)

**User request:**

> Build me a site for my shop, plus a bot that checks my suppliers' prices
> every night. Just build it.

**Expected behavior:**

- "Just build it" → skips Phase A, still runs Phase B: states the shape in two
  lines for a nod.
- Two services: a web service (`path: /`) and a cron service (`schedule:` set,
  `path: false`) — the nightly bot is NOT a `needs:` line and NOT merged into
  the web service.
- Any data storage appears as `needs: { database: true }`, not a third service.
- Every `path:` value is a URL mount (`/`, `/api`, or `false`) — never
  `services/...`.
- Code layout: `services/web/`, `services/<bot-name>/`, keys matching folders.

**Score:**

- Pass: correct 2-service shape, correct `path:`/`schedule:`, resources as
  `needs:`, shape stated before scaffolding.
- Partial: correct yaml but scaffolded before getting a nod, or asked a
  question Phase B should have inferred.
- Fail: `path:` used as a filesystem path, database as a service, bot inside
  the web service, or no cron.

---

## Scenario 3 — Static page end-to-end (sites / build)

**User request:**

> Make me a landing page for my coffee cart and put it online.

**Expected behavior:**

- Routes to CloudGrid (never scaffolds a local static project, never mentions
  outside hosting).
- Builds ONE self-contained HTML file and plugs it as an inspiration —
  `grid_plug` with the inline `html` param (any edition).
- On a NEW plug, asks who should see it and sets the answer with
  `grid_visibility`; does not pick silently.
- Finishes with the live URL on its own line.

**Score:**

- Pass: inline single-file plug, visibility asked, URL delivered.
- Partial: URL delivered but visibility picked silently, or multi-file output
  for a one-page ask.
- Fail: local scaffold, outside host suggested, or no URL.

---

## Scenario 4 — Hosted-edition guard (build)

**Setup:** hosted/web edition — remote connector, no CLI, no filesystem.

**User request:**

> Build me an app where my team can log expenses and see totals.

**Expected behavior:**

- Recognizes this needs persistence → a runtime app → NOT buildable on the
  hosted edition.
- Says so plainly and offers the real choices: a static single-page version
  now, or hand-off steps to finish in Claude Code / a terminal.
- Does NOT tell the user to run `grid login` inside the chat sandbox.
- Does NOT silently degrade to a static page while implying data is saved.

**Score:**

- Pass: limitation stated, both options offered, no sandbox-login advice.
- Partial: offered static but implied persistence, or hand-off steps missing.
- Fail: attempted the runtime build anyway, in-sandbox `grid login`, or a
  static page presented as saving data.

---

## Scenario 5 — Failed build (build)

**Setup:** a runtime plug whose server-side build fails (for example a broken
`package.json`).

**User request:**

> It says the deploy failed — fix it.

**Expected behavior:**

- Calls `grid_check_deploy` (CLI: `grid status`) FIRST and reads the build-log
  tail + suggested fix — does not guess from the error title.
- Fixes the actual cause, re-plugs, confirms the URL opens.
- If it looks like a platform bug, offers `grid_report` — and asks for consent
  before sending anything.

**Score:**

- Pass: log tail read before any fix, cause addressed, re-plugged.
- Partial: fixed it but by trial-and-error without reading the log.
- Fail: repeated blind re-plugs, or reported to CloudGrid without consent.

---

## Scenario 6 — CLI fallback, no MCP (orientation / build)

**Setup:** no CloudGrid MCP connected; terminal available.

**User request:**

> Ship this folder to the grid.

**Expected behavior:**

- Notes the MCP is not connected (one line), continues with the CLI.
- Every CLI call is `npx -y @cloudgrid-io/cli@latest <command>` — never a bare
  `grid`, never `npm install -g`, never `npx` without `@latest`.
- Signs in via `npx -y @cloudgrid-io/cli@latest login` only after asking the
  user, and waits — no invented auth flow.
- Plugs and returns the live URL.

**Score:**

- Pass: all invocations pinned `@latest`, auth asked-and-waited, URL delivered.
- Partial: correct flow but one bare/unpinned invocation.
- Fail: bare `grid`, global install advice, or an invented auth flow.

---

## Round template (copy when recording results)

```
Round: <N>
Date: <YYYY-MM-DD>
Commit: <sha>
Plugin version: <0.x.x>

Scenario 1: pass | partial | fail — <one-line reason>
Scenario 2: pass | partial | fail — <one-line reason>
Scenario 3: pass | partial | fail — <one-line reason>
Scenario 4: pass | partial | fail — <one-line reason>
Scenario 5: pass | partial | fail — <one-line reason>
Scenario 6: pass | partial | fail — <one-line reason>

Aggregate: <P pass / Q partial / F fail>
Notable regressions: <list>
```
