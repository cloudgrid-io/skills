---
version: 0.1.0
name: cloudgrid-brain
description: |
  Refresh a CloudGrid entity's Grid Brain metadata. Use when the user wants to
  re-classify an entity, regenerate its description, tags, or diagram, or update
  how it appears in discovery after a change. Wraps cloudgrid brain refresh.
argument-hint: "[name]"
allowed-tools: Bash
---

# CloudGrid Brain

Re-run the Grid Brain hooks for an entity to re-classify its description, tags, and
diagram. Wraps `cloudgrid brain refresh`.

Status: stub. Full implementation lands in Phase 2.

## Step 0 — Bootstrap

1. If `cloudgrid` is not on `$PATH`: `npm install -g @cloudgrid-io/cli`
2. If `cloudgrid whoami` fails: ask the user to run `cloudgrid login`. Wait for
   confirmation.

## Usage

```
cloudgrid brain refresh my-thing --wait
```
