# Using CloudGrid skills and MCP

Two surfaces expose CloudGrid actions:

- **Skills** — `SKILL.md` files an agent loads (this repo). They trigger from
  natural language (their `description`) or a slash command.
- **MCP server** — the same actions as MCP tools, for clients that speak the Model
  Context Protocol. Published separately as
  [`@cloudgrid-io/mcp`](https://github.com/cloudgrid-io/mcp).

Which one you use depends on the client. Pick your client below.

## Skills

| Skill | Invoke | What it does |
|---|---|---|
| `brainstorm` | `/cloudgrid:brainstorm` | Align on the idea, goal, and core features before building. |
| `build` | `/cloudgrid:build` | Structure the project (cloudgrid.yaml, services, needs) and take it live with a public URL. |
| `sites` | `/cloudgrid:sites` | Project-scoped override for agents with a built-in sites skill. Routes site builds to CloudGrid. |

## MCP tools (shared — available on both local and hosted editions)

| Tool | What it does |
|---|---|
| `grid_start` | Orient: returns the playbook, context, and sign-in state. |
| `grid_get_template` | Fetch a workflow, template, or example from the corpus. |
| `grid_plug` | Plug a directory, URL, or inline HTML into the grid. Returns the live URL. |
| `grid_pull` | Pull an existing entity's source into a local directory. |
| `grid_pickup` | Pick up where a previous entity left off. |
| `grid_get_app_source` | Read the deployed source of an entity. |
| `grid_check_deploy` | Check the status of a deploy (build log, errors). |
| `grid_login` | Sign in to CloudGrid (in-tool, no CLI needed). |
| `grid_login_status` | Check whether the login flow has completed. |
| `grid_visibility` | Set entity visibility (link, grid, unlisted). |
| `grid_create_grid` | Create a new grid. |
| `grid_list_grids` | List the user's grids. |
| `grid_note` | Send a note to the CloudGrid team. |
| `grid_report` | Report an issue with an entity. |

The local (stdio) edition has 22 additional CLI-wrapping tools for project
management, secrets, environment variables, logs, and more.

## Prerequisites

- **Node 18+** (for `npx`).
- **No login needed to try it** — anonymous plug works out of the box. For owned
  entities (into your grid), run `npx -y @cloudgrid-io/cli@latest login` once,
  or use the `grid_login` MCP tool.

---

## Claude Code (terminal, VS Code, JetBrains)

Three install routes. They land in **different menus** — this is the most common
point of confusion.

### Route 1 — skills via the skills CLI
```
npx skills add cloudgrid-io/skills
```
- Installs into `~/.claude/skills/` (personal). Auto-loads, no restart.
- **Find them under `/skills`** (labeled Personal). **Not** under `/plugin`.
- Invoke as **`/brainstorm`**, `/build`, … (bare — the personal route has no
  namespace), or describe the task.

### Route 2 — skills as a plugin
```
/plugin marketplace add cloudgrid-io/skills
/plugin install cloudgrid@cloudgrid-skills
```
- **Find it under `/plugin`**; the skills also show under `/skills` (labeled Plugin).
- Invoke as **`/cloudgrid:build`** (plugin namespace + short skill name), or describe the task.

### Route 3 — the MCP server (STDIO, local)

**Prerequisite: Node 18+.** The local (STDIO) server is a Node process. Check with
`node --version`; to install Node:

```
brew install node                      # macOS
winget install OpenJS.NodeJS.LTS       # Windows (then reopen the terminal)
sudo apt install nodejs npm            # Debian/Ubuntu (or use nvm)
```

Register the server:

```
claude mcp add cloudgrid -- npx -y @cloudgrid-io/mcp
```

- **Find it under `/mcp`.** Exposes tools `grid_plug`, `grid_login`, …
- Invoke by describing the task; the model calls the tool.

### Clean reinstall (old version still showing?)

Old versions hide in two places: the npx cache and the client registration.
Clear both, then register fresh:

```
rm -rf ~/.npm/_npx                    # npx cache - a stale @latest pin lives here
npm cache clean --force
claude mcp remove cloudgrid           # or delete the entry from your client's MCP config
claude mcp add cloudgrid -- npx -y @cloudgrid-io/mcp
```

**Windows:** the npx cache is `%LocalAppData%\npm-cache\_npx` (clear with
`rd /s /q "%LocalAppData%\npm-cache\_npx"`).
Claude Desktop's `.mcpb` extension never auto-updates - remove it in Settings,
Extensions and install the fresh one from the latest release. Fully restart the
client afterwards; a running session keeps its old server process.

### Route 3b — the MCP server (hosted, remote)

Nothing to install and no Node needed — point a remote-capable client at the
hosted endpoint. Two endpoints, two postures:

```
https://mcp.cloudgrid.io/mcp              anonymous-first; sign in later from inside the conversation
https://mcp-connected.cloudgrid.io/mcp    OAuth sign-in at add-time; every plug is owned from the first one
```

Use `mcp.cloudgrid.io` for casual, no-account installs. Use
`mcp-connected.cloudgrid.io` for org connectors (claude.ai, ChatGPT) where
OAuth sign-in at add-time is preferred.

> Where did my install go? `/skills` (skills), `/plugin` (plugin), `/mcp` (MCP).
> If you don't see something, you're probably looking in the wrong menu, or you
> installed a different route than you're checking. `/doctor` flags real problems.

### Sharing with a team (Claude Code)
Commit a project-scoped MCP so teammates get it on clone:
```
cd your-shared-repo
claude mcp add cloudgrid -s project -- npx -y @cloudgrid-io/mcp
git add .mcp.json && git commit -m "add CloudGrid MCP"
```
Or each person runs Route 1 or `claude mcp add ... -s user` once.

---

## Claude Desktop (chat)

Desktop chat extends via **MCP only** — it does not read a skills folder.
Easiest: download `cloudgrid.mcpb` from
https://github.com/cloudgrid-io/mcp/releases/latest and double-click to install
(Settings → Extensions) — no terminal, no Node.

Manual alternative (needs Node 18+, see the Node install box above):
register the server in
`~/Library/Application Support/Claude/claude_desktop_config.json`
(**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`):
```json
{ "mcpServers": { "cloudgrid": { "command": "npx", "args": ["-y", "@cloudgrid-io/mcp"] } } }
```
Then **fully quit and reopen** Claude Desktop. The CloudGrid tools appear under the
tools icon. Invoke by describing the task.

---

## Codex, Cursor, Cline, Gemini CLI, and other coding agents

```
npx skills add cloudgrid-io/skills
```
Installs into the universal `.agents/skills/` location these agents read (Cursor
also reads `~/.cursor/skills`; target one agent with `-a codex` / `-a cursor`).
Codex and Cursor also take the plugin route (`codex plugin marketplace add
cloudgrid-io/skills`; Cursor's in-app marketplace) and the MCP server — local
(`npx -y @cloudgrid-io/mcp` in their MCP config) or remote with nothing
installed (`https://mcp-connected.cloudgrid.io/mcp` as a `url` entry in
`~/.codex/config.toml` or `~/.cursor/mcp.json`). See INSTALL.md for exact
snippets.

---

## claude.ai web and the ChatGPT app

These connect to **remote** MCP servers (by URL), not local ones. The hosted web
edition is live — add it as a custom connector:

Two endpoints, two postures:

```
https://mcp.cloudgrid.io/mcp              anonymous-first; sign in later from inside the conversation
https://mcp-connected.cloudgrid.io/mcp    OAuth sign-in at add-time (the connected endpoint)
```

The connected endpoint runs the client's own OAuth connect at add-time (sign in
with CloudGrid right in the flow); every plug is owned from the first one. The
anonymous endpoint needs no account; sign in later from inside the conversation.

- **claude.ai web** — Settings → Connectors → add custom connector.
- **ChatGPT** — add it as a custom connector (Developer Mode; availability depends
  on plan / rollout).
- **Codex and Cursor** accept the same URL — see the section above.

---

## Skill vs MCP — which should I use?

Same capabilities; different surface.

- **Skills** carry guidance (when to use, how to phrase results) and auto-trigger
  from natural language. Best in agents that read skills (Claude Code, Cursor, …).
- **MCP** exposes the actions as tools. Best where skills are not read (Claude
  Desktop, claude.ai web, ChatGPT) or when you want explicit tools.

You can install both; they do not conflict.
