---
version: 0.1.7
name: cloudgrid-drop
description: |
  Share an artifact instantly with no login. Use when the user wants to share,
  publish, send, or deploy an HTML page or file and is not signed in, or just
  wants a link to send a friend. Uploads to CloudGrid and returns a public URL.
  Anonymous, inspirations only, 7-day expiry, claimable later.
argument-hint: "[file]"
allowed-tools: Bash
---

# CloudGrid Drop

Publish an artifact and get a shareable URL — with no account and no CLI. This is
the fastest path from "I made a thing" to "here is a link."

It calls the CloudGrid API directly. It does **not** use the `cloudgrid` CLI and it
does **not** require login. That is the point: anyone can drop.

## When to use this vs cloudgrid-plug

- **Drop (this skill):** the user is not signed in, or just wants a quick public
  link for an HTML page or file. Anonymous. Inspirations only.
- **Plug (`cloudgrid-plug`):** the user is signed in and wants a full app deploy in
  their own org. Uses the CLI.

If the user is signed in and asks to "share" a static artifact, this skill still
works and is faster; offer `cloudgrid-plug` only when they want an app.

## UX rules

- Be concise. The result the user wants is the URL. Print it plainly.
- Detect the user's language from their first message and reply in it.
- Do not ask the user to log in. The whole value here is that they do not have to.

## How to run it

You need a single HTML file. If the user gave you inline HTML, write it to a file
first. The content must be a full HTML document (start with `<!doctype html>` or
`<html>`); if you only have a fragment, wrap it in a minimal document. HTML is
capped at 2 MB for anonymous drops.

Then POST it:

```
curl -sS -X POST https://api.cloudgrid.io/api/v2/drop/auto \
  -F "artifact=@/path/to/index.html;type=text/html"
```

The response is JSON. Read two fields:

- `url` — the live, shareable link. Give this to the user.
- `claim_url` — the link to sign in and keep it past the 7-day expiry.

## After the drop

Print the `url` on its own line, by itself, so it can be copied in one go. Then add
one line: the drop is anonymous and lasts 7 days, and they can claim it to keep it.
Do not bury the URL in prose.

## Limits and errors

- Anonymous drops are **inspirations only**. A full app needs sign-in — if the
  artifact is an app, the API returns 401; switch to `cloudgrid-plug`.
- HTML over 2 MB is rejected. Trim it or suggest signing in.
- There is a per-IP and per-device daily cap. If you hit 429, tell the user to try
  again later.
