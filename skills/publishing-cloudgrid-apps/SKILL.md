---
version: 0.1.0
name: publishing-cloudgrid-apps
description: |
  Use when the user wants to control who can open an app or share it - "publish",
  "make it public", "make it private", "share with my team", "who can see this",
  "send someone the link". Sets visibility and hands back the right URL.
allowed-tools: Bash
---

# Publishing CloudGrid apps

Deploying already returns a URL; publishing is about **who can open it**. A new
deploy starts restricted to the owner's grid - choose the audience explicitly.

## Visibility levels

Set with `grid_visibility` (direct-API, any edition) or `grid visibility`:

- `private` - only you.
- `space` - a space (a sub-group inside a grid).
- `org` / your grid - your team.
- `authenticated` - anyone signed in to CloudGrid.
- `link` - anyone with the URL (public share).

## Flow

1. Ask who should be able to open it (don't decide silently).
2. Apply their choice with `grid_visibility`; it defaults its target to the thing
   published this session, so "make it private" needs no id.
3. Return the URL, and note the audience you set.

## Rules

- On every NEW deploy, ask visibility rather than guessing.
- `link` is a genuine public share - confirm before making something public.
- To restrict a team app, `org`/`space` is usually right; for real per-user login
  see `adding-authentication`. To serve it on the user's own domain, see
  `using-custom-domains`.
