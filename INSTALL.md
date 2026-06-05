# Install

CloudGrid Skills work in any agent that reads `SKILL.md` files. The steps below
cover the CLI prerequisite, then each agent.

## Prerequisite: the CloudGrid CLI

Every skill drives the `cloudgrid` CLI. Install it once and log in:

```
npm install -g @cloudgrid-io/cli
cloudgrid login
```

`cloudgrid whoami` confirms you are logged in.

## Add the skills

Pick the method that matches your agent.

### Any agent (skills CLI)

```
npx skills add cloudgrid-io/skills
```

### Claude Code

```
/plugin marketplace add cloudgrid-io/skills
```

The marketplace manifest lives in `.claude-plugin/`.

### Codex

Three routes:

```
codex plugin marketplace add cloudgrid-io/skills      # plugin (manifest: .codex-plugin/)
npx skills add cloudgrid-io/skills -a codex           # skills only (-> ~/.agents/skills)
```

Or the MCP server, in `~/.codex/config.toml` — local or the hosted URL:

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

Remote variant, nothing installed: `{ "mcpServers": { "cloudgrid": { "url": "https://mcp.cloudgrid.io/mcp" } } }`

### Manual

```
git clone https://github.com/cloudgrid-io/skills.git
```

Then point your agent at the cloned directory.

## MCP server

The MCP server lives in `mcp-server/`. Run it from a clone today:

```
cd mcp-server
npm install
npm start
```

The published package lands at launch. After that:

```
npx -y @cloudgrid-io/mcp
```

It wraps the same `cloudgrid` CLI and uses the same credentials, so no extra login
is needed. See [mcp-server/README.md](mcp-server/README.md).

## For agents

If you are an agent reading this to install the skills yourself, read
[INSTALL_FOR_AGENTS.md](INSTALL_FOR_AGENTS.md) instead. It is written as steps you
can execute directly.
