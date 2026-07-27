# Worker Report: fix(skills) — P1 accuracy fixes

## diff --stat

```
 .claude-plugin/plugin.json                    |  4 ++--
 VERSION                                       |  2 +-
 hooks/session-start                           |  2 +-
 hooks/user-prompt                             |  2 +-
 skills/build/SKILL.md                         | 10 +++++-----
 skills/build/reference/cloudgrid.yaml.example |  8 ++++----
 6 files changed, 14 insertions(+), 14 deletions(-)
```

No twinned files in the diff.

## Changes by file:line

### Task 1 — dead file reference

| File | Line | Change |
|---|---|---|
| `skills/build/SKILL.md` | 274-278 | Repointed `reference/cloudgrid.yaml.example` (unreachable via MCP) to `grid_get_template({kind: "doc", name: "cloudgrid-yaml"})` with `cloudgrid-yaml.md` as fallback. The old path resolves locally but not when the skill is read through the MCP corpus, which does not ship the `reference/` subdirectory. |

### Task 2 — verb drift ("deploy" -> "plug")

| File | Line | Change |
|---|---|---|
| `skills/build/SKILL.md` | 5 | "deploying" -> "plugging" in skill description (agent-facing prose describing what the skill does) |
| `skills/build/reference/cloudgrid.yaml.example` | 11 | "deploys to exactly" -> "plugs to exactly" in reference file header comment |
| `.claude-plugin/plugin.json` | 4 | "one-step deploys" -> "one-step plugs" in plugin marketplace description |
| `hooks/session-start` | 4 | "deploy" -> "plug" in bash comment (not agent-facing, hygiene) |

**Judgment calls (not changed):**

- `skills/build/SKILL.md:8` — "deploy" in trigger keyword list ("Trigger on build, make, create, scaffold, prototype, deploy, ship..."). This is a detection keyword for user intent, not agent speech. The brainstorm skill explicitly says "recognize 'deploy' when the USER says it; say 'plug' when you speak." Kept for detection.
- `SKILL.md:4` (root) — "deploy" in description trigger list. Same reasoning: user-intent detection.
- `SKILL.md:19` (root) — "When the user wants to build / create / make / deploy / publish..." — lists user intents. The sentence routes to "plug" as the action.
- `hooks/session-start:31` — bootstrap sentence lists "deploy" as a user-intent word ("When the user wants to build, create, make, deploy, publish..."). The sentence ends with "plug -> return the live share URL". Changing this would break the bootstrap hash test AND is incorrect (the agent needs to recognize "deploy" from users). Kept.
- `hooks/user-prompt:33` — "deploy" in the regex that detects build intent from user prompts. This is a detection keyword. Kept.
- `grid_check_deploy`, `grid_rollback_deploy` — real tool names. Not touched.

### Task 3 — at-risk rules surfaced

| File | Line | Change |
|---|---|---|
| `hooks/user-prompt` | 66 | Added lazy-env-read rule to the per-turn nudge: "Read grid-injected env vars lazily (inside a handler or getter, never at module top level — a top-level read breaks next build)." |

**Assessment — persistence rule:** Already well-placed in the skills surface. Present in:
- `skills/brainstorm/SKILL.md:74` (Phase A, step 5 — "does it need to save data / accounts / AI?")
- `skills/brainstorm/SKILL.md:129` ("it saves data, has logins, or uses AI — those are `needs:` lines, not services")
- `skills/brainstorm/SKILL.md:233-235` (table: "save data / accounts / multi-user state" -> `needs: { database: true }`)
- `skills/build/SKILL.md:52-64` (Step 1: static vs runtime distinction)
- `hooks/user-prompt:66` (nudge: "saves data -> needs: { database: true }")
- `SKILL.md:90-91` (root rules section)

No change needed — the skills surface has this rule at six independent points including the per-turn nudge.

**Assessment — lazy env reads:** Was in the build skill (step 3, line 203) and brainstorm skill (Phase B6, lines 231, 252) but NOT in the user-prompt nudge — the most durable reinforcement channel. Added it there. This is the single highest-leverage placement: the nudge fires on every build-intent turn and survives context compression.

### Task 4 — `object_storage` assessment

| File | Line | Change |
|---|---|---|
| `skills/build/reference/cloudgrid.yaml.example` | 93-95 | Replaced usage forms (`true | { size: 10Gi }`) with GATED warning and "Do not author this need." |

**Assessment:** `cloudgrid-yaml.md` (twinned, not edited) already says GATED + "rejected at plug-time" at every occurrence. In the skills surface:
- `skills/build/SKILL.md:189-192` — already properly gated: "gated — do not author it yet" with the `#1678` reference and workaround. No change needed.
- `skills/build/reference/cloudgrid.yaml.example:93-95` — showed `object_storage: true` and `{ size: 10Gi }` usage forms as commented examples, identical in appearance to every other need. An agent reading the reference file would see it as usable. Fixed: replaced usage forms with GATED warning + "Do not author this need."
- `skills/build/reference/cloudgrid.yaml.example:75` — lists `object_storage` in the nine-needs comment alongside the others. Left unchanged: it is a factual enumeration, and the GATED warning at line 93 now guards the usage.

No other skills-side file presents `object_storage` as usable.

## Version bump

- `.claude-plugin/plugin.json`: 0.14.34 -> 0.14.35
- `VERSION`: 0.14.34 -> 0.14.35

## Lint output

```
$ node .github/scripts/lint-skills.mjs
ok   skills/brainstorm/SKILL.md
ok   skills/build/SKILL.md
ok   skills/sites/SKILL.md
All 3 SKILL.md file(s) passed.

$ node .github/scripts/no-internal-refs.mjs
No internal references found.

$ node --test bin/bootstrap-hash.test.mjs
pass 1, fail 0
```

The session-start bootstrap sentence (line 31) was NOT changed. Only the bash comment above it (line 4) was updated. The bootstrap hash test passes because the hash-tested sentence is unchanged.
