---
version: 0.1.0
name: cloudgrid-plug
description: |
  Deploy a directory or URL to CloudGrid. Use when the user wants to ship, deploy,
  publish, or go live with the current project, or turn a URL into a hosted entity.
  Live in about 30 seconds. Wraps cloudgrid plug.
argument-hint: "[path-or-url]"
allowed-tools: Bash
---

# CloudGrid Plug

Build and deploy the current directory, a path, or a URL. Prints the live URL.
Wraps `cloudgrid plug`.

Status: stub. Full implementation lands in Phase 2.

## Step 0 — Bootstrap

1. If `cloudgrid` is not on `$PATH`: `npm install -g @cloudgrid-io/cli`
2. If `cloudgrid whoami` fails: ask the user to run `cloudgrid login`. Wait for
   confirmation.

## Usage

```
cloudgrid plug
```
