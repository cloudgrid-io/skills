# Open questions

Decisions held for the founder. Each has a shipped default so work is not blocked.

## 1. Public org handle (the one that matters)

**Question:** What is the final public GitHub org and brand handle for this repo?
The kickoff assumed `cloudgrid-io` to match the existing npm scope, but the founder
is reconsidering the name.

**Status:** undecided. The GitHub org `cloudgrid-io` does not exist yet.

**Shipped default:** the repo is staged under a personal account and docs use
`cloudgrid-io` as the provisional handle so commands stay copy-pasteable.

**Two distinct references, do not conflate when renaming:**

- **Fixed — the published CLI package** `@cloudgrid-io/cli`. Already on npm. Keep
  this literal even if the GitHub org changes, unless the CLI is republished under
  a new scope.
- **Provisional — this repo's home and downstream names**: GitHub paths
  (`cloudgrid-io/skills`, `/plugin marketplace add cloudgrid-io/skills`,
  `npx skills add cloudgrid-io/skills`), the not-yet-published MCP package
  (`@cloudgrid-io/mcp`), and plugin manifest identifiers.

**Rename procedure (when the handle lands):** replace the provisional GitHub-org
references and the unpublished package names, but leave `@cloudgrid-io/cli` alone.
Review each hit; do not blind-`sed` the shared substring.

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
