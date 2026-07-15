---
version: 0.1.0
name: iterating-on-a-live-app
description: |
  Use when the user wants to change an app that's already deployed - "add a
  feature", "change X", "update the app", "add a page/field", "tweak the
  behavior". Edits the existing entity and re-deploys in place to the same URL.
allowed-tools: Bash
---

# Iterating on a live app

The app is already live; make the change and re-deploy the SAME entity so the URL
and deploy history are preserved.

## Flow

1. **Get the current source.** If you don't have it in context: for a single-page
   inspiration use `grid_source`; for a multi-file app that lives in a folder, use
   the linked folder (or `grid_pickup` to adopt it and pull its source down).
2. **Make the change** - a feature, a field, a page, a fix. Keep the stack and
   the data wiring; only change what's asked.
3. **Re-deploy in place:** `grid_deploy` with `target_entity_id` (or grid+slug).
   Same entity_id, same URL. A runtime change is an async build - poll to live.
4. Return the (unchanged) URL and confirm the change is live.

## Rules

- Always re-deploy the SAME entity - creating a new one changes the URL and
  loses continuity.
- For a purely visual change use `improving-app-ui`; if it broke, use
  `debugging-deployments`.
- Don't reset secrets/env or the DB wiring on a re-deploy unless asked.
