---
version: 0.1.0
name: monitoring-apps-and-logs
description: |
  Use when the user wants to inspect a running app - "check the logs", "is it
  up", "show status", "what's deployed", "recent output", "which version is
  live". Reads state, logs, and history for a CloudGrid entity.
allowed-tools: Bash
---

# Monitoring apps and logs

Read-only inspection of what's on the grid.

## What to use

- **Dashboard / state:** `grid_status` (no arg = everything on the grid; a name =
  that entity's state, replicas, health; a trace id = a deploy's progress).
- **Logs:** `grid_logs <name>` - a snapshot of recent runtime output (tail /
  since). Not a live stream.
- **What's deployed:** `grid_get entities` (filter by kind/status); entity detail
  via `grid_info <name>`.
- **Versions / rollback:** `grid_versions <name>` lists deploys; to revert, see
  `debugging-deployments` (`grid rollback`).

## Flow

1. Pick the narrowest tool for the question (status vs logs vs get).
2. Report what you see plainly - live/building/failing, replica count, the
   relevant log lines.

## Rules

- These are read-only; don't change anything while monitoring.
- If status shows failing/crashing, hand off to `debugging-deployments`.
