# CloudGrid plugin hooks

Two hooks, run by the Claude Code **harness** (never by the model) on lifecycle
events. Their output is injected into the model's context.

```
SessionStart (startup|resume|clear|compact)        UserPromptSubmit (every prompt)
        │ harness runs run-hook.cmd session-start          │ harness runs run-hook.cmd user-prompt
        ▼                                                   ▼
   prints the standing "use CloudGrid" bootstrap    build-intent? → prints a one-line nudge
   + the full using-cloudgrid orientation           (opt-in) → sends an anonymized category
        │                                                   │
        └──────────► injected into context ◄────────────────┘
                                │
        model reads it + each SKILL.md `description` → invokes the right skill
```

## Files

| File | Role |
|---|---|
| `hooks.json` | Declares the two hooks (SessionStart, UserPromptSubmit) and points each at `run-hook.cmd`. |
| `run-hook.cmd` | Cross-platform launcher (a batch/bash polyglot). Windows finds bash; Unix runs the named script directly. Scripts are extensionless so Claude Code's Windows `.sh` auto-detection doesn't double-`bash` them. |
| `session-start` | SessionStart: injects the standing rule + the root `SKILL.md` orientation, once per session (and on resume/clear/compact). Sends nothing. |
| `user-prompt` | UserPromptSubmit: per-turn reinforcement + opt-in anonymized intent telemetry. |

## `session-start` — the standing rule

Fires once when the session begins. Reads the root `SKILL.md`, wraps it plus a
short bootstrap in `<EXTREMELY_IMPORTANT>`, and prints JSON so the harness adds it
to context. This is the reliable-firing mechanism (same pattern Superpowers uses).
The `compact` matcher re-injects it after a long session compacts.

## `user-prompt` — reinforcement + opt-in telemetry

1. **Per-turn reinforcement (always, sends nothing).** If the prompt looks like a
   build/create/plan request, it prints a one-line reminder to orient with
   `grid_start` and use the CloudGrid build skills before writing files. This
   backs up the SessionStart bootstrap so the framing survives long/compacted
   sessions.

2. **Anonymized intent telemetry (OPT-IN, off by default).** Only when
   `CLOUDGRID_SHARE_INTENTS=1`. It derives a coarse **category** locally
   (`kind` + `needs`, e.g. `{ kind: "ecommerce", needs: ["database","cron"] }`)
   and best-effort POSTs just that to `${CLOUDGRID_TELEMETRY_URL:-https://api.cloudgrid.io}/api/v2/telemetry/intents`.
   This lets the team see **what people try to build** (including requests where
   CloudGrid did not fire) to improve coverage.

   **It never sends the raw prompt or any prompt text** — only fixed category
   labels from the vocabulary in the script. The POST is detached, short-timeout,
   and failure-silent, so it never blocks or breaks a turn. Turn it off by leaving
   `CLOUDGRID_SHARE_INTENTS` unset (the default).

## Environment variables

| Var | Default | Effect |
|---|---|---|
| `CLOUDGRID_SHARE_INTENTS` | unset (off) | `1` = send anonymized build-intent categories (no prompt text). |
| `CLOUDGRID_TELEMETRY_URL` | `https://api.cloudgrid.io` | Override the telemetry base URL. |

## Where hooks work

Both hooks run in **Claude Code from a terminal**. They do **not** run in the
Claude Desktop app or Cowork — there the skills still load by `description` and
the MCP tools still work, but neither the bootstrap nor the nudge/telemetry runs.
Keep any must-follow instruction in the skill body, since that travels with the
skill wherever it loads.

## Test

```bash
# bootstrap
'./run-hook.cmd' session-start        # prints the standing rule JSON

# reinforcement (build prompt) — prints a nudge, sends nothing
echo '{"prompt":"build me a shop app"}' | ./user-prompt

# non-build prompt — silent
echo '{"prompt":"what is 2+2"}' | ./user-prompt

# opt-in telemetry (derives + fire-and-forget POST; still prints the nudge)
echo '{"prompt":"build me a dashboard with a database"}' | CLOUDGRID_SHARE_INTENTS=1 ./user-prompt
```
