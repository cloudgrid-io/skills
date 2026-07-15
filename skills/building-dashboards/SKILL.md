---
version: 0.1.0
name: building-dashboards
description: |
  Use when the user wants a dashboard - "dashboard", "metrics", "KPIs", "stats
  page", "status board", "charts", "analytics view". Builds a display dashboard
  and deploys it on CloudGrid; static data deploys instantly, live data becomes a
  runtime app.
allowed-tools: Bash
---

# Building dashboards

Pick the shape from where the data comes from:

- **Static / baked-in data** -> the `dashboard` archetype: a single
  self-contained HTML page with the numbers and charts inline. Instant
  inspiration, any edition. Fetch `grid_fetch("template", "dashboard")`, fill it,
  `grid_deploy` inline via `html`.
- **Live / stored data** (metrics from a database, updates over time) -> a runtime
  app with `needs: { database: true }` (the analytics/monitoring/financial/
  revenue dashboard family). Local edition, async deploy. See
  `building-cloudgrid-apps` and `adding-databases`.

## Flow

1. Ask which numbers matter and whether they are fixed or come from stored data.
2. Choose static vs runtime from that answer (state it; don't quiz on infra).
3. Fetch the matching template, fill the metrics/charts, deploy, return the URL,
   ask visibility.

## Rules

- Charts should be client-side and dependency-free for a single-page dashboard.
- Don't claim live data on a static page - if it must update, it's a runtime app.
