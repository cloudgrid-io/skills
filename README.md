# CloudGrid Skills

Multi-agent skills for CloudGrid. Install them in Claude Code, Codex, or Cursor,
and your agent can build, ship, and run things on CloudGrid through the
`grid` CLI.

## What CloudGrid is

CloudGrid runs web apps at a live public URL with the infrastructure they need:
managed MongoDB, Redis (cache, queues, pub/sub), a pgvector store, persistent
disk, and an AI gateway that needs no API key, in any language or stack, with no
Docker or Kubernetes to manage. A directory becomes a live app in about 30
seconds. These skills let your agent scaffold, declare what the app needs,
build, plug it in, tail logs, share, and read feedback.

## Install

1. Install the `grid` CLI and sign in. The skills use it for project folders.

   ```
   brew install cloudgrid-io/tap/grid     # macOS, Linux
   npm install -g @cloudgrid-io/cli       # any platform
   grid login
   ```

2. Add the plugin in Claude Code:

   ```
   /plugin marketplace add cloudgrid-io/skills
   /plugin install cloudgrid@cloudgrid-skills
   ```

   The plugin adds the skills and connects the hosted CloudGrid connector
   (`https://mcp.cloudgrid.io/mcp`). It starts no local server, has no hooks,
   and collects no telemetry. A project folder goes live through the `grid`
   CLI; content from the conversation, and account actions such as visibility,
   collaborators, and grids, go through the connector. The plugin folder is
   [`plugins/cloudgrid/`](plugins/cloudgrid/); its README lists everything the
   plugin runs, sends, and connects to.

   The skills show under `/plugin` and `/skills` as `cloudgrid:brainstorm`
   and `cloudgrid:build`, or describe what you want ("share this HTML page as
   a link") and the matching one triggers.

   Or install with the `gh skill` extension:

   ```
   gh skill install cloudgrid-io/skills
   ```

   Other agents (Cursor, Cline, Gemini CLI): `npx skills add cloudgrid-io/skills`.
   They install as `build`, `brainstorm`; the CloudGrid prefix comes from the
   plugin namespace, which those agents don't have.

   Claude Desktop, claude.ai, ChatGPT, and every route in one place: [USAGE.md](USAGE.md).

## What it looks like

```
/cloudgrid:build
```

`cloudgrid:build` publishes a single HTML page (or deploys a full app) and hands
back a public URL. Describe what you want ("build me a landing page for my
podcast"), or point it at an existing project directory. The skill handles
sign-in, scaffolding, and plugging. You get a live link.

## Skills

| Skill | Invoke | What it does |
|---|---|---|
| `brainstorm` | `/cloudgrid:brainstorm` | Align on the idea, goal, and core features before building. |
| `build` | `/cloudgrid:build` | Structure the project (cloudgrid.yaml, services, needs) and take it live with a public URL. |
| `sites` (project-scoped) | written by `grid agent` | Not a plugin skill: `grid agent` drops it into a project (`.agents/skills/sites/`) to shadow a coding agent's built-in sites skill. Canonical copy: `project-skills/sites/`. |

## The canonical chain

```
brainstorm  ->  build
```

That is the full "I built a thing and shipped it" loop. [COOKBOOK.md](COOKBOOK.md)
walks through it end to end.

## MCP server

The Claude Code plugin above connects the hosted CloudGrid connector. For other
clients, point a remote-capable client at `https://mcp.cloudgrid.io/mcp`, or run
the local server published as
[`@cloudgrid-io/mcp`](https://github.com/cloudgrid-io/mcp). See
[USAGE.md](USAGE.md) for per-client setup.

**One CloudGrid server per client.** Do not add the connector or the local server
again in a client that has the plugin: every `grid_*` tool would appear twice,
and the two servers hold separate sign-in state. How to tell: two `cloudgrid`
entries in the client's MCP or connector list, or duplicate `grid_*` tools.

## Contact

Support: support@cloudgrid.io. Privacy: privacy@cloudgrid.io. Legal:
legal@cloudgrid.io. Security reports: see [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
