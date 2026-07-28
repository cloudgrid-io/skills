# Open questions

Decisions held for the founder. Each has a shipped default so work is not blocked.

## 1. Public org handle — RESOLVED (2026-06-03)

**Resolved:** the handle is `cloudgrid-io`, matching the npm scope. The founder
created the `cloudgrid-io` GitHub org and the repo was transferred there from the
personal staging account. It now lives at `github.com/cloudgrid-io/skills`. All
docs use `cloudgrid-io` literally, which is now correct, not provisional.

## 2. MCP server package name

**Question:** `@cloudgrid-io/mcp` vs `@cloudgrid-io/mcp-server` vs `cloudgrid-mcp`?

**Resolved:** `@cloudgrid-io/mcp` — matches the npm scope, short. Published on
npm and live at `https://mcp.cloudgrid.io/mcp`. The MCP server now lives in its
own repo at [github.com/cloudgrid-io/mcp](https://github.com/cloudgrid-io/mcp).

## 3. Watermark in skill output

**Question:** The platform injects a CloudGrid watermark on served entities. Should
that watermark also appear in skill output, for example when a skill prints a
share URL?

**Shipped default:** no. The watermark lives on the served page, not in CLI or
skill output.

## 4. Skill versioning — RESOLVED (2026-07-28)

**Resolved:** per-skill versions are independent. `.claude-plugin/plugin.json`
is the single source of truth for the plugin version; `VERSION` and
`package.json` mirror it (`check-versions.mjs` enforces this). Each `SKILL.md`
`version:` carries its own semver — bump it when that skill changes, not on
every release.
