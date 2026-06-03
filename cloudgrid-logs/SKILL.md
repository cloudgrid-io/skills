---
version: 0.1.0
name: cloudgrid-logs
description: |
  Tail logs for a CloudGrid entity. Use when the user wants to see logs, watch
  output, follow a running app, debug a deploy, or check why something is failing.
  Wraps cloudgrid logs.
argument-hint: "[name]"
allowed-tools: Bash
---

# CloudGrid Logs

Stream or tail logs from an entity's pods. Wraps `cloudgrid logs`.

Status: stub. Full implementation lands in Phase 2.

## Step 0 — Bootstrap

1. If `cloudgrid` is not on `$PATH`: `npm install -g @cloudgrid-io/cli`
2. If `cloudgrid whoami` fails: ask the user to run `cloudgrid login`. Wait for
   confirmation.

## Usage

```
cloudgrid logs my-thing --follow
```
