# CloudGrid Skills

Multi-agent skills for CloudGrid. Install them in Claude Code, Codex, or Cursor,
and your agent can build, ship, and run things on CloudGrid through the
`cloudgrid` CLI.

## Why CloudGrid

Claude Code and Codex removed the wall around writing code. CloudGrid removes the
wall around shipping it. A directory or a URL becomes a live, addressable thing in
about 30 seconds. These skills are how your agent crosses that second wall on your
behalf: scaffold, deploy, tail logs, share, read feedback. Everything here is free.

## Install in 3 steps

1. Install the CLI:

   ```
   npm install -g @cloudgrid-io/cli
   ```

2. Log in:

   ```
   cloudgrid login
   ```

3. Add the skills to your agent:

   ```
   npx skills add cloudgrid-io/skills
   ```

   Claude Code users can also run `/plugin marketplace add cloudgrid-io/skills`.
   See [INSTALL.md](INSTALL.md) for Codex, Cursor, and manual methods.

## Skills

| Skill | Invoke | What it does |
|---|---|---|
| `cloudgrid-init` | `/cloudgrid:init` | Scaffold a new app or agent. |
| `cloudgrid-plug` | `/cloudgrid:plug` | Deploy a directory or URL. Live in about 30 seconds. |
| `cloudgrid-logs` | `/cloudgrid:logs` | Tail logs for an entity. |
| `cloudgrid-share` | `/cloudgrid:share` | Make an entity shareable and print its URL. |
| `cloudgrid-feedback` | `/cloudgrid:feedback` | Read the feedback feed. |
| `cloudgrid-brain` | `/cloudgrid:brain` | Refresh an entity's Grid Brain metadata. |

## The canonical chain

```
init  ->  plug  ->  logs  ->  share  ->  feedback
```

That is the full "I built a thing and shipped it" loop. [COOKBOOK.md](COOKBOOK.md)
walks through it end to end.

## MCP server

An MCP server exposes the same six actions as MCP tools, for agents that speak the
Model Context Protocol. It is in progress; see [INSTALL.md](INSTALL.md) for status.

## License

Apache 2.0. See [LICENSE](LICENSE).
