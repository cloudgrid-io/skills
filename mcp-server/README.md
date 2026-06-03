# @cloudgrid-io/mcp

An MCP server for CloudGrid. It exposes six tools — `init`, `plug`, `logs`,
`share`, `feedback`, `brain` — by wrapping the `cloudgrid` CLI. The CLI handles
auth, org context, and error formatting; this server does not re-implement any of
that.

## Prerequisite

Install and log in to the CLI:

```
npm install -g @cloudgrid-io/cli
cloudgrid login
```

The server reads no credentials directly. It runs `cloudgrid`, which uses its own
stored credentials at `~/.cloudgrid/credentials`.

## Run

```
npx -y @cloudgrid-io/mcp
```

Or from a clone:

```
cd mcp-server
npm install
npm start
```

It speaks MCP over stdio. Point any MCP client at the `cloudgrid-mcp` command.

## Tools

| Tool | Wraps | Notes |
|---|---|---|
| `cloudgrid_drop` | `POST /api/v2/drop/auto` | Anonymous artifact drop. No CLI, no login. Calls the API directly. |
| `cloudgrid_init` | `cloudgrid init` | Register an app or agent; optionally seed a web service. |
| `cloudgrid_plug` | `cloudgrid plug` | Deploy a directory or URL. |
| `cloudgrid_logs` | `cloudgrid logs` | Snapshot of recent logs. Does not stream. |
| `cloudgrid_share` | `cloudgrid visibility set` | Set visibility, default link. |
| `cloudgrid_feedback` | `cloudgrid feedback list` | Read the org feedback feed. |
| `cloudgrid_brain` | `cloudgrid brain refresh` | Re-run the Grid Brain hooks. |

`cloudgrid_drop` is the one tool that does not wrap the CLI. The anonymous drop has
no identity to manage, so it posts straight to the public endpoint — which means it
works with nothing installed and nobody signed in.

## Test

A smoke test spawns the server with a real MCP client, lists the tools, and calls
the read-only `cloudgrid_feedback` tool end to end:

```
cd mcp-server
npm install
npm run smoke
```

It needs a logged-in CLI on `$PATH`.

## Design

- Shells out with `execFile` and an argument array, so there is no shell and no
  injection surface.
- `cloudgrid_logs` never uses `--follow`; a streaming call would never return.
- Stateless. Each call is one CLI invocation.
