---
version: 0.1.0
name: deploying-existing-apps
description: |
  Use when the user already has code and wants it live - "deploy this project",
  "host my app", "publish my repo", "put this folder online", "import / migrate
  my app to CloudGrid". Gets an existing project running on CloudGrid with a live
  URL.
allowed-tools: Bash
---

# Deploying existing apps

The user has a project already (a folder, a repo, static files). Get it live -
don't rebuild it from scratch.

## Flow

1. **Look at what they have.** A single static file / built site, or a source
   project with a build step, or a server app (Node/Next/Python)? Check for an
   existing `package.json`, build script, and entry point.
2. **Gate the edition.** A multi-file/build/server app needs the local edition
   (Claude Desktop/Code) or the CLI - the hosted MCP can only publish a single
   static page. A lone self-contained HTML file can go on any edition.
3. **Write / confirm `cloudgrid.yaml`.** Pick the service `type`
   (`static` / `node` / `nextjs` / `python`); for a static build set the build
   command + output; declare any `needs:` the app already uses (see
   `adding-databases`). If they already use a database, wire bring-your-own via a
   secret rather than making them migrate.
4. **Deploy the folder** with `grid_deploy` -> poll to the live URL -> ask
   visibility.

## Fits

- A zipped project: see `drop-zip-file` (extract first, never plug the .zip).
- To keep editing it afterward and re-deploy in place: `iterating-on-a-live-app`.

## Rules

- Preserve their structure and stack; adapt `cloudgrid.yaml` to it, don't rewrite
  the app. Never hardcode secrets - wire them via `grid secrets`.
