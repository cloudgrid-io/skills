---
version: 0.1.0
name: adding-authentication
description: |
  Use when an app needs sign-in or access control - "add login", "user
  accounts", "sign in", "auth", "protect this page", "only my team can see it".
  Explains CloudGrid's two honest options: restrict access with visibility, or
  bring your own auth provider wired via secrets.
allowed-tools: Bash
---

# Adding authentication

CloudGrid does not impose a managed end-user auth service. There are two honest
paths - pick by what the user actually needs.

## 1. Restrict who can open the app (no code)

If they just want "only my team / only me / only signed-in CloudGrid users can
see it", that is **visibility**, not app auth. Set it with `grid_visibility` /
`grid visibility`: `private`, a `space`, your `org`/grid, `authenticated`
(anyone signed in), or `link`. See `publishing-cloudgrid-apps`. This is the
right answer surprisingly often - reach for it first.

## 2. Bring your own auth provider (real per-user login)

For real accounts inside the app (Auth0, Clerk, Supabase Auth, NextAuth, your
own), the app implements it and CloudGrid holds the provider's keys as
write-only secrets:

- `grid secrets set AUTH_CLIENT_SECRET=...` (and any `env` config with
  `grid env`), then read them at runtime. Never commit keys.
- The blueprint archetypes that need auth/Stripe use a `vault:` block that maps
  an org vault item to an env var - follow that pattern (see `cloudgrid-yaml.md`).

## Rules

- Don't claim a managed CloudGrid login service - there isn't one; it's
  visibility (built in) or BYO provider (via secrets/vault).
- Never hardcode or commit auth secrets.
