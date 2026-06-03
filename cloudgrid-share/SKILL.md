---
version: 0.1.0
name: cloudgrid-share
description: |
  Make a CloudGrid entity shareable and print its URL. Use when the user wants to
  share a link, make something public, send an app to someone, or get a shareable
  URL. Wraps cloudgrid visibility.
argument-hint: "[name]"
allowed-tools: Bash
---

# CloudGrid Share

Set an entity's visibility to link so anyone with the URL can reach it, then print
the URL. Wraps `cloudgrid visibility <slug> link`.

Status: stub. Full implementation lands in Phase 2.

## Step 0 — Bootstrap

1. If `cloudgrid` is not on `$PATH`: `npm install -g @cloudgrid-io/cli`
2. If `cloudgrid whoami` fails: ask the user to run `cloudgrid login`. Wait for
   confirmation.

## Usage

```
cloudgrid visibility my-thing link
```
