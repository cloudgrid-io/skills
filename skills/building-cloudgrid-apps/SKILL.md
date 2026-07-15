---
version: 0.1.0
name: building-cloudgrid-apps
description: |
  Use to build a real, data-backed application on CloudGrid once the idea is
  clear - "build the app", "make it", a web app that saves data, has accounts, or
  serves multiple users. The general runtime build loop: scaffold, wire data,
  build, deploy, return the live URL.
allowed-tools: Bash
---

# Building CloudGrid apps

The standard loop for a runtime app (one that saves data or runs server code).
For a static single page, use the archetype skills instead (landing page, game,
etc.) - they publish instantly. This is for apps that need a backend.

## Loop

1. **Plan briefly** (see `planning-cloudgrid-apps`): features, data needs, and a
   matching template (`choosing-cloudgrid-templates`).
2. **Gate the edition.** A runtime app is built and deployed, so it needs the
   local edition (Claude Desktop/Code) or the CLI - the hosted MCP can only
   publish static pages. Say so if the user is on hosted.
3. **Scaffold.** `grid_init` an app, then fetch the template
   (`grid_fetch("template", "<name>")`). Put service code under `services/<name>/`.
4. **Wire data.** Declare `needs:` in `cloudgrid.yaml` (see `adding-databases`,
   `adding-ai-features`). Read the injected env vars LAZILY, never at module top
   level. Never hardcode a connection string or secret.
5. **Build + deploy (async).** `grid_deploy` the folder; the deploy is async -
   poll `grid_status` to the live URL, with a liveness signal while it builds.
6. **Validate + return the URL,** then ask what visibility the user wants.

## Rules

- Local edition only for runtime apps; be honest about async deploys.
- Prefer a template/recipe over scratch.
- Iterate by re-deploying the SAME entity (`target_entity_id`) - same URL.
