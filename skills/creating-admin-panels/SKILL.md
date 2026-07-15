---
version: 0.1.0
name: creating-admin-panels
description: |
  Use when the user wants an internal tool that manages records - "admin panel",
  "admin dashboard", "back office", "CRUD admin", "manage records", "internal
  tool". Builds a database-backed CRUD app on CloudGrid and deploys it to a live
  URL.
allowed-tools: Bash
---

# Creating admin panels

An admin panel is a CRUD app over stored records - the `admin-dashboard`
archetype (the DB-CRUD family: also `crm`, `kanban`, `task-manager`,
`inventory`, `job-board`, `ticket-system`). It saves data, so it is a **runtime
app** (Mongo-backed), local edition, async deploy.

## Flow

1. Confirm the records and fields (what does each row hold, what actions - add /
   edit / delete / list).
2. Gate the edition: runtime apps need the local edition or the CLI (not hosted).
3. Scaffold + fetch `grid_fetch("template", "admin-dashboard")`; put code under
   `services/web/`.
4. Declare `needs: { database: true }`; read `DATABASE_MONGODB_URL` lazily (see
   `adding-databases`). Never hardcode a connection string.
5. `grid_deploy` (async) -> poll to the live URL -> ask visibility.

## Rules

- If it's display-only (no editing), it's a dashboard, not an admin panel.
- To restrict who can use it, set visibility (org / a space) - and for real
  per-user login, see `adding-authentication` (bring-your-own auth).
