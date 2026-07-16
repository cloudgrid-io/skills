# Install (for agents)

You are an agent. These are steps to execute, not prose to summarize. Run them in
order. Stop and ask the user only where a step says to.

## 1. Ensure the CLI is present

Check whether `grid` is on `$PATH`:

```
grid --version
```

If that fails, install it:

```
npm install -g @cloudgrid-io/cli
```

## 2. Ensure the user is logged in

```
grid whoami
```

If that fails, tell the user to run `grid login` and wait for them to confirm.
Do not attempt to log in for them. Do not invent an auth flow.

## 3. Confirm the skills are available

The skills live in this repo, one directory per skill, each with a `SKILL.md`.
Load the `SKILL.md` for the action the user wants:

- `skills/brainstorm/SKILL.md` — align on the idea, goal, and core features first
- `skills/build/SKILL.md` — structure the project (cloudgrid.yaml, services, needs) and take it live

## 4. Follow the skill

Each `SKILL.md` carries its own steps. Follow them exactly. The common rules:

- Wrap only the `grid` CLI. Do not call the API directly.
- Detect the user's language from their first message and reply in it. Keep
  technical flags in English.
- Print results concisely: URLs and short summaries. Never dump raw JSON or IDs.
- Pick sane defaults. Ask one thing at a time, only when something is genuinely
  missing.

## 5. The canonical chain

For a full build-and-ship loop, run the skills in this order:

```
brainstorm -> build
```

See `COOKBOOK.md` for the worked example.
