# Scenarios

11 scenarios across 9 skills. Each is one user request + what the agent should do + how to score it.

These exist to be run by a human (or by another agent acting as the user) in a fresh session with skills installed.

---

## Scenario 1 — Anonymous drop (drop)

**User request:**

> Share this HTML page.

(User is not signed in. An HTML file or inline HTML is present in the conversation.)

**Expected behavior:**

- Uses the `drop` skill, not `plug`.
- Calls the CloudGrid API directly (`POST https://api.cloudgrid.io/api/v2/drop/auto`), not the CLI.
- Does not ask the user to sign in or install anything.
- Reads `url` and `claim_url` from the JSON response.
- Prints the live URL on its own line.
- Mentions the 7-day expiry and that claiming extends it.
- Does not print raw JSON, entity IDs, or the full API response.

**Score:**

- Pass: API called directly, URL delivered plainly, no raw JSON in chat.
- Partial: correct flow but printed raw JSON or the full response object.
- Fail: tried to use the CLI, asked the user to log in, or used `plug`.

---

## Scenario 2 — Full build-and-ship chain (init -> plug -> share)

**User request:**

> Create a new app called my-thing, deploy it, and share it.

**Expected behavior:**

- Runs `cloudgrid init app my-thing` (with or without `--type`, depending on context).
- Then runs `cloudgrid plug` from the project directory.
- Then runs `cloudgrid visibility set my-thing link`.
- Does not skip steps. Does not jump straight to `plug` without `init`.
- Prints the live URL after `plug`. Prints the shareable URL after `share`.
- Offers `logs` or `feedback` as a next step.

**Score:**

- Pass: all three steps in order, live URL printed, no steps skipped.
- Partial: correct chain but skipped the `share` step or did not print the URL.
- Fail: skipped `init`, used `drop` instead of the authenticated flow, or ran steps out of order.

---

## Scenario 3 — Deploy a directory (plug)

**User request:**

> Deploy this project.

(A `.cloudgrid` config already exists in the working directory.)

**Expected behavior:**

- Uses the `plug` skill.
- Runs `cloudgrid plug` (no arguments needed; uses the linked entity).
- Does not re-run `init` when `.cloudgrid` already exists.
- Waits for the build to finish. Does not interrupt the stream.
- Prints the live URL when done.

**Score:**

- Pass: `cloudgrid plug` run, URL printed, no unnecessary `init`.
- Partial: correct deploy but re-ran `init` or asked about the entity name.
- Fail: used `drop` instead of `plug`, or failed to print the URL.

---

## Scenario 4 — Tail logs (logs)

**User request:**

> Show me the logs for my-thing.

**Expected behavior:**

- Uses the `logs` skill.
- Runs `cloudgrid logs my-thing` (with `--tail` or `--since` for a one-time check).
- Does not use `--follow` unless the user says "watch" or "stream."
- Summarizes the output: healthy, errors, key lines.
- Does not paste pages of raw log output into chat.

**Score:**

- Pass: correct command, summarized output, no raw dump.
- Partial: correct command but pasted full log output without summary.
- Fail: wrong command, used `--follow` for a one-time check, or dumped raw JSON.

---

## Scenario 5 — Claim after anonymous drop (claim)

**User request:**

(Earlier in the session, the user dropped something anonymously. They have now signed in.)

> Claim that drop.

**Expected behavior:**

- Uses the `claim` skill.
- Reads the `claim_url` or token from the earlier drop response.
- Calls `POST https://api.cloudgrid.io/api/v2/anon-claim` with the JWT and claim token.
- Does not re-drop the artifact.
- Reports that the drop is now owned, the URL is unchanged, and the new expiry.

**Score:**

- Pass: claim API called with correct token, ownership confirmed, no re-drop.
- Partial: claimed successfully but did not mention the unchanged URL or new expiry.
- Fail: re-dropped instead of claiming, or used the wrong token.

---

## Scenario 6 — Language detection

**User request:**

> Publica esta pagina HTML en CloudGrid.

(User provides an HTML file. User is not signed in.)

**Expected behavior:**

- Detects user language as Spanish.
- Replies in Spanish for all status messages, questions, and summaries.
- Keeps technical content in English: URLs, API flags, file paths.
- Uses the `drop` skill (anonymous, no login required).
- Delivers the URL.

**Score:**

- Pass: Spanish for human-facing text, English for technical content, URL delivered.
- Partial: half-translated (e.g., translated the URL domain or flag names).
- Fail: replied entirely in English when the user wrote in Spanish.

---

## Scenario 7 — Refresh Grid Brain metadata (brain)

**User request:**

> Update the metadata for my-thing.

**Expected behavior:**

- Uses the `brain` skill.
- Runs `cloudgrid brain refresh my-thing --wait`.
- Waits for the refresh to finish (up to about 60 seconds).
- Summarizes what changed: new tags, updated description, diagram regenerated.
- Does not print the full hook trace or raw CLI output.

**Score:**

- Pass: correct command with `--wait`, summarized outcome, no raw output.
- Partial: correct command but printed the full hook trace.
- Fail: wrong command, omitted `--wait` when the user wanted to see the result, or dumped raw JSON.

---

## Scenario 8 — Read feedback (feedback)

**User request:**

> Any feedback on my-thing?

**Expected behavior:**

- Uses the `feedback` skill.
- Runs `cloudgrid feedback list` (optionally with `--since` if the user implied a time window).
- Summarizes the feed: groups by theme, surfaces bugs or blockers first.
- Does not paste every event verbatim.
- Does not confuse reading feedback with sending feedback.

**Score:**

- Pass: correct command, summarized feed, no raw dump.
- Partial: correct command but pasted the full event list without summary.
- Fail: sent feedback to the CloudGrid team instead of reading it, or used the wrong command.

---

## Scenario 9 — Share with a link (share)

**User request:**

> Make my-thing public.

**Expected behavior:**

- Uses the `share` skill.
- Runs `cloudgrid visibility set my-thing link`.
- Defaults to `link` mode (anyone with the URL can open it).
- Does not use a wider mode (`authenticated`, `org`, `space`) unless the user asked for it.
- Prints the outlet URL on its own line.

**Score:**

- Pass: correct command, `link` mode, URL printed plainly.
- Partial: correct command but used a different visibility mode without asking.
- Fail: wrong command, or did not print the URL.

---

## Scenario 10 — Drop with signed-in user (drop vs plug routing)

**User request:**

> Share this HTML file.

(User is signed in. The artifact is a single static HTML file, not an app project.)

**Expected behavior:**

- Uses the `drop` skill. Drop is still valid for quick sharing even when signed in.
- Calls the API with the user's JWT and org headers (signed-in drop, owned).
- Or offers `plug` as an alternative if the user wants a full app deploy.
- Does not force the heavier `init -> plug` flow for a single file.
- Prints the URL.

**Score:**

- Pass: used `drop` (signed-in variant) or offered the choice, URL delivered.
- Partial: used `plug` but completed successfully and printed the URL.
- Fail: forced `init -> plug` for a single HTML file, or failed to deliver a URL.

---

## Scenario 11 — Init with type selection (init)

**User request:**

> Scaffold a new Python API.

**Expected behavior:**

- Uses the `init` skill.
- Infers `--type python` from the user's request.
- Asks for a name if not provided (a slug, 3-40 lowercase characters).
- Runs `cloudgrid init app <name> --type python` once the name is confirmed.
- Reports that the entity is registered and suggests `cloudgrid plug` as the next step.

**Score:**

- Pass: correct command with `--type python`, name confirmed, next step offered.
- Partial: correct type but did not confirm the name or suggest the next step.
- Fail: wrong type, skipped `init`, or used `agent` instead of `app`.

---

## Round template (copy when recording results)

```
Round: <N>
Date: <YYYY-MM-DD>
Commit: <sha>
Skills version: <0.x.x>

Scenario 1:  pass | partial | fail — <one-line reason>
Scenario 2:  pass | partial | fail — <one-line reason>
Scenario 3:  pass | partial | fail — <one-line reason>
Scenario 4:  pass | partial | fail — <one-line reason>
Scenario 5:  pass | partial | fail — <one-line reason>
Scenario 6:  pass | partial | fail — <one-line reason>
Scenario 7:  pass | partial | fail — <one-line reason>
Scenario 8:  pass | partial | fail — <one-line reason>
Scenario 9:  pass | partial | fail — <one-line reason>
Scenario 10: pass | partial | fail — <one-line reason>
Scenario 11: pass | partial | fail — <one-line reason>

Aggregate: <P pass / Q partial / F fail>
Time-to-result mean: <Ns>
Notable regressions: <list>
```
