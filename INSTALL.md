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

The Codex plugin manifest lives in `.codex-plugin/plugin.json`. Follow the Codex
plugin install steps and point them at this repo. Exact command pending Codex docs.

### Cursor

The Cursor plugin manifest lives in `.cursor-plugin/plugin.json`. Follow the Cursor
plugin install steps and point them at this repo. Exact command pending Cursor docs.

### Manual

```
git clone https://github.com/cloudgrid-io/skills.git
```

Then point your agent at the cloned directory.

## MCP server

The MCP server is in progress. When published, install it with:

```
npx -y @cloudgrid-io/mcp
```

It wraps the same `cloudgrid` CLI and reads the same credentials, so no extra
login is needed.

## For agents

If you are an agent reading this to install the skills yourself, read
[INSTALL_FOR_AGENTS.md](INSTALL_FOR_AGENTS.md) instead. It is written as steps you
can execute directly.
