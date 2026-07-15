---
version: 0.1.0
name: improving-app-ui
description: |
  Use when the user wants an existing deployed app to look better - "improve the
  UI", "make it look nicer", "redesign this", "polish the design", "better
  styling / layout". Fetches the current page, improves the design, and
  re-deploys in place to the same URL.
allowed-tools: Bash
---

# Improving app UI

The user has something live and wants it to look better. Keep the content and
behavior; improve the presentation, and re-deploy the SAME entity so the URL
doesn't change.

## Flow

1. **Get the current source.** If you don't already have the HTML in context,
   call `grid_source` to fetch the live page.
2. **Improve the design** - hierarchy, spacing, type, color, responsiveness,
   states. Keep it a single self-contained file for an inspiration (no external
   CDNs/fonts); for a multi-file app, edit its front-end under `services/web/`.
3. **Re-deploy in place** with `grid_deploy` and `target_entity_id` (or grid+slug)
   - same entity, same URL, updated look.
4. Show the user the (unchanged) live URL.

## Rules

- Don't change what the app does - this is a visual pass. If they also want
  feature changes, use `iterating-on-a-live-app`.
- Re-deploy the same entity; don't create a new one (that would make a new URL).
- Preserve any data wiring and secrets untouched.
