# CloudGrid Skills

Multi-agent skills for CloudGrid. Install them in Claude Code, Codex, or Cursor,
and your agent can build, ship, and run things on CloudGrid through the
`grid` CLI.

## Why CloudGrid

Claude Code and Codex removed the wall around writing code. CloudGrid removes the
wall around running it. It is a live runtime environment: your app runs there WITH
the infrastructure it needs out of the box — managed MongoDB, Redis (cache, queues,
pub/sub), a pgvector store, persistent disk, and built-in AI with no API keys — in
any language or stack, with no Docker or Kubernetes to manage. A directory or a URL
becomes a live, addressable, running thing in about 30 seconds. These skills are how
your agent crosses that second wall on your behalf: scaffold, declare what the app
needs, build, plug it in, tail logs, share, read feedback. Everything here is free.

## Install in 2 steps

1. Log in (installs the CLI on first run):

   ```
   npx -y @cloudgrid-io/cli@latest login
   ```

2. Add the agent-core. In Claude Code (recommended):

   ```
   /plugin marketplace add cloudgrid-io/skills
   /plugin install cloudgrid@cloudgrid-skills
   ```

   One install wires up everything: the skills, the SessionStart orientation
   hook, and the CloudGrid MCP server (`grid_start`, `grid_get_template`, and the
   CLI-wrapping tools). The MCP auto-starts when the plugin is enabled — no
   separate `claude mcp add` needed.

   The skills show under `/plugin` and `/skills` as `cloudgrid:brainstorm`,
   and `cloudgrid:build` — or just say what you want
   ("share this HTML page as a link") and the right one triggers.

   Or install with the `gh skill` extension:

   ```
   gh skill install cloudgrid-io/skills
   ```

   Other agents (Cursor, Cline, Gemini CLI): `npx skills add cloudgrid-io/skills`.
   They install as `build`, `brainstorm` — the CloudGrid brand comes from the plugin
   namespace, which those agents don't have.

   Claude Desktop, claude.ai, ChatGPT, and every route in one place: [USAGE.md](USAGE.md).

## What it looks like

```
/cloudgrid:build
```

`cloudgrid:build` publishes a single HTML page (or deploys a full app) and hands
back a public URL. Describe what you want ("build me a landing page for my
podcast"), or point it at an existing project directory. The skill handles
sign-in, scaffolding, and plugging — you get a live link.

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

The Claude Code plugin above already bundles the MCP server — installing
`cloudgrid@cloudgrid-skills` starts it automatically. For every other client, the
MCP server is published separately as
[`@cloudgrid-io/mcp`](https://github.com/cloudgrid-io/mcp). It exposes the same
actions as MCP tools, for agents that speak the Model Context Protocol.
Install it with `npx -y @cloudgrid-io/mcp`, or point a remote-capable client at
`https://mcp.cloudgrid.io/mcp`. See [USAGE.md](USAGE.md) for per-client setup.

**Do not run the plugin and a hosted connector side by side.** The plugin bundles
the local (stdio) MCP server; if the same client ALSO has a CloudGrid remote
connector (`mcp.cloudgrid.io` or `mcp-connected.cloudgrid.io`), every `grid_*`
tool appears twice, the two servers hold separate sign-in state, and they can
disagree about whether you are signed in. How to tell: two `cloudgrid` entries in
the client's MCP/connector list, or duplicate `grid_*` tools in the tool picker.
Fix: keep the plugin (it can build runtime apps from folders and shares the CLI's
sign-in) and remove the connector in that client — or the reverse in a client
where you only publish single pages.

## License

Apache 2.0. See [LICENSE](LICENSE).
