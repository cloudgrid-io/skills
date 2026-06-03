---
version: 0.1.0
name: cloudgrid-init
description: |
  Scaffold a new CloudGrid app or agent. Use when the user wants to start a new
  project, create a new entity, set up a new app or agent, or seed a web service
  (node, nextjs, python, or static) before deploying. Wraps cloudgrid init.
argument-hint: "[app|agent] [name]"
allowed-tools: Bash
---

# CloudGrid Init

Register a new app or agent in the active org and, optionally, seed a web service.
Wraps `cloudgrid init`.

Status: stub. Full implementation lands in Phase 2.

## Step 0 — Bootstrap

1. If `cloudgrid` is not on `$PATH`: `npm install -g @cloudgrid-io/cli`
2. If `cloudgrid whoami` fails: ask the user to run `cloudgrid login`. Wait for
   confirmation.

## Usage

```
cloudgrid init app my-thing --type static
```
