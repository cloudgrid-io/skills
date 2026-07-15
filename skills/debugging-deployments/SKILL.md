---
version: 0.1.0
name: debugging-deployments
description: |
  Use when a CloudGrid deploy or app is failing - "it failed", "won't deploy",
  "build error", "why is it broken", "page won't load", "app keeps crashing",
  "health check failing". Reads status and logs, maps common errors to fixes, and
  re-deploys.
allowed-tools: Bash
---

# Debugging deployments

Diagnose from real signal, don't guess.

## Flow

1. **Status first:** `grid_status <name>` - is it building, live, or failing, and
   how many replicas are ready.
2. **Logs:** `grid_logs <name>` for build/runtime output. If there are no logs and
   `0/0 replicas`, the pods never scheduled - suspect a `needs:` resource that
   isn't provisioning, or a bad `cloudgrid.yaml`, not app code.
3. **Map the common causes:**
   - "Service directory not found: services/<name>" -> code isn't under
     `services/<name>/`, or a root-level static build needs `source: { path: . }`.
   - "started but didn't answer a health check" -> the app isn't listening on
     `process.env.PORT` (default 8080), or a startup read of an injected env var
     ran at module top level before the grid injected it (read it LAZILY).
   - static build with no output -> check the `build` command + `output` dir.
   - a `needs:` resource stuck provisioning -> report it (it may be a platform
     issue), and try without that resource to isolate.
4. **Fix + re-deploy** the same entity (`grid_deploy` with `target_entity_id`) and
   re-check status.

## Rules

- Cite the actual status/log line; don't invent a cause.
- If a platform resource clearly won't provision, use `grid_report` (with the
  user's consent) so the team sees it.
