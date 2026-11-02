# Install

CloudGrid Skills work in any agent that reads `SKILL.md` files. The steps below
cover the CLI prerequisite, then each agent.

## Prerequisite: the CloudGrid CLI

The skills plug project folders with the `grid` CLI. Install it, then sign in:

```
brew install cloudgrid-io/tap/grid     # macOS, Linux
npm install -g @cloudgrid-io/cli       # any platform
grid login
```

`grid whoami` confirms you are signed in.

## Add the skills

Pick the method that matches your agent.

### Any agent (gh skill extension)

Requires the `gh-skill` extension first (`gh skill` is not a built-in gh command):

```
gh extension install github/gh-skill
gh skill install cloudgrid-io/skills
```

### Any agent (skills CLI)

Installs into the agent-neutral `~/.agents/skills` location — NOT the Claude Code
plugin surface (for Claude Code, use the section below):

```
npx skills add cloudgrid-io/skills
```

### Claude Code

First time:

```
/plugin marketplace add cloudgrid-io/skills
/plugin install cloudgrid@cloudgrid-skills
```

Already added it before — update to the latest:

```
/plugin marketplace update cloudgrid-skills
/plugin update cloudgrid
```

`/plugin marketplace add` errors if the marketplace is already installed
(`Marketplace 'cloudgrid-skills' is already installed`) — it is not an update
command. Use `marketplace update` to refresh, or `/plugin marketplace remove
cloudgrid-skills` then add again for a clean reinstall. (A stale cached version
staying pinned while the source moves ahead is the usual cause of "the skills
won't install / update".)

The marketplace manifest lives in `.claude-plugin/` (marketplace name:
`cloudgrid-skills`, plugin name: `cloudgrid`); the plugin itself is in
`plugins/cloudgrid/`. Installing the plugin adds the skills and connects the
hosted CloudGrid connector (`https://mcp.cloudgrid.io/mcp`), so no separate
`claude mcp add` is needed. It starts no local server and has no hooks.

### Codex

Start here. One command, no install and no account needed:

```
npx -y @cloudgrid-io/cli@latest agent --yes
```

Run it in the project folder. It writes `AGENTS.md` (Codex reads it) and a
project-scoped `sites` skill, so "build me a page" routes to CloudGrid instead of
Codex's own site builder. Restart Codex afterwards so the skill loads at session
start; the `AGENTS.md` directive already steers the current session.

Then add the skills or the MCP server:

```
codex plugin marketplace add cloudgrid-io/skills      # plugin (manifest: .codex-plugin/)
npx skills add cloudgrid-io/skills -a codex           # skills only (-> ~/.agents/skills)
```

Or the MCP server, in `~/.codex/config.toml`, local or the hosted URL:

```toml
[mcp_servers.cloudgrid]
command = "npx"
args = ["-y", "@cloudgrid-io/mcp"]

# or remote, nothing installed:
# [mcp_servers.cloudgrid]
# url = "https://mcp.cloudgrid.io/mcp"
```

### Cursor

Cursor reads Agent Skills natively (v2.4+):

```
npx skills add cloudgrid-io/skills -a cursor          # -> ~/.cursor/skills + ~/.agents/skills
```

Or install the plugin from Cursor's in-app marketplace (manifest: `.cursor-plugin/`).
Or the MCP server, in `~/.cursor/mcp.json`:

```json
{ "mcpServers": { "cloudgrid": { "command": "npx", "args": ["-y", "@cloudgrid-io/mcp"] } } }
```

Remote variant, nothing installed: `{ "mcpServers": { "cloudgrid": { "url": "https://mcp.cloudgrid.io/mcp" } } }`. The Cursor plugin manifest (`.cursor-plugin/`) connects this URL.

### Gemini CLI

Add the MCP server with the built-in command:

```
gemini mcp add cloudgrid npx -y @cloudgrid-io/mcp
```

Or edit `~/.gemini/settings.json` (user) or `.gemini/settings.json` (project) directly:

```json
{ "mcpServers": { "cloudgrid": { "command": "npx", "args": ["-y", "@cloudgrid-io/mcp"] } } }
```

### Antigravity

Google's Antigravity IDE/CLI shares one MCP config at `~/.gemini/config/mcp_config.json`
(open it from the IDE: Settings, Customizations, Open MCP Config / Manage MCP Servers,
View raw config). Add the local stdio server:

```json
{ "mcpServers": { "cloudgrid": { "command": "npx", "args": ["-y", "@cloudgrid-io/mcp"] } } }
```

Antigravity uses `serverUrl` (not `url`) for remote HTTP servers, so the remote variant is
`{ "mcpServers": { "cloudgrid": { "serverUrl": "https://mcp.cloudgrid.io/mcp" } } }`.

### Manual

```
git clone https://github.com/cloudgrid-io/skills.git
```

Then point your agent at the cloned directory.

## MCP server

The MCP server is published separately as
[`@cloudgrid-io/mcp`](https://github.com/cloudgrid-io/mcp).

**Prerequisite for the local (STDIO) server: Node 18+** (`node --version`). To
install Node: macOS `brew install node`; **Windows** `winget install
OpenJS.NodeJS.LTS` (then reopen the terminal); Debian/Ubuntu `sudo apt install
nodejs npm`; or the installer at https://nodejs.org.

Register the server in your client config:

```json
{ "mcpServers": { "cloudgrid": { "command": "npx", "args": ["-y", "@cloudgrid-io/mcp"] } } }
```

TOML clients (Codex):

```toml
[mcp_servers.cloudgrid]
command = "npx"
args = ["-y", "@cloudgrid-io/mcp"]
```

It wraps the same `grid` CLI and uses the same credentials, so no extra login
is needed. Remote-capable clients can point at the hosted endpoint instead:
`https://mcp.cloudgrid.io/mcp`.
See [USAGE.md](USAGE.md) for per-client snippets.

**One CloudGrid server per client.** Run either the local (stdio) server or a
hosted connector in a given client, never both. Running both duplicates the 14
shared `grid_*` tool names, and the two servers hold separate sign-in state (the
local edition uses the CLI's `~/.cloudgrid/credentials`; the connector holds an
OAuth session) — they can disagree about whether you are signed in. How to tell:
duplicate `grid_*` entries in the tool list, or two CloudGrid servers in the
client's MCP settings. The Claude Code plugin connects the hosted connector, so
do not add the local server in a client that has the plugin.

### Claude Desktop — one-click install

Claude Desktop users can install the MCP as a Desktop Extension with no terminal,
no Node, and no JSON editing. Download the bundle and double-click it (or in Claude
Desktop: Settings, Extensions, Install from file):

```
https://github.com/cloudgrid-io/mcp/releases/latest/download/cloudgrid.mcpb
```

The bundle carries the full local toolset (including the `grid` CLI), so deploy
and secrets tools work without a separate install. Sign in from chat with the
`grid_login` tool on first use.

## For agents

If you are an agent reading this to install the skills yourself, read
[INSTALL_FOR_AGENTS.md](INSTALL_FOR_AGENTS.md) instead. It is written as steps you
can execute directly.
