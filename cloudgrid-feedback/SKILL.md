---
version: 0.1.0
name: cloudgrid-feedback
description: |
  Read the CloudGrid feedback feed. Use when the user wants to see feedback, check
  what people said, review reactions, or read the feedback events for their work.
  Wraps cloudgrid feedback list.
argument-hint: "[--since 7d]"
allowed-tools: Bash
---

# CloudGrid Feedback

List feedback events. Wraps `cloudgrid feedback list`.

Status: stub. Full implementation lands in Phase 2.

## Step 0 — Bootstrap

1. If `cloudgrid` is not on `$PATH`: `npm install -g @cloudgrid-io/cli`
2. If `cloudgrid whoami` fails: ask the user to run `cloudgrid login`. Wait for
   confirmation.

## Usage

```
cloudgrid feedback list
```
