# Open questions

Decisions held for the founder. Each has a shipped default so work is not blocked.

## 1. Public org handle — RESOLVED (2026-06-03)

**Resolved:** the handle is `cloudgrid-io`, matching the npm scope. The founder
created the `cloudgrid-io` GitHub org and the repo was transferred there from the
personal staging account. It now lives at `github.com/cloudgrid-io/skills`. All
docs use `cloudgrid-io` literally, which is now correct, not provisional.

## 2. MCP server package name

**Question:** `@cloudgrid-io/mcp` vs `@cloudgrid-io/mcp-server` vs `cloudgrid-mcp`?

**Shipped default:** `@cloudgrid-io/mcp` — matches the npm scope, short. Not yet
published, so it is cheap to change. Tied to question 1.

## 3. Watermark in skill output

**Question:** The platform injects a CloudGrid watermark on served entities. Should
that watermark also appear in skill output, for example when a skill prints a
share URL?

**Shipped default:** no. The watermark lives on the served page, not in CLI or
skill output.

## 4. Skill versioning

**Question:** Version each skill independently, or track one repo version?

**Shipped default:** one repo version. `VERSION` is canonical; each `SKILL.md`
`version:` tracks it. Independent versioning is over-engineering for now.
