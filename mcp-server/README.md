# @cloudgrid-io/mcp

An MCP server for CloudGrid. It exposes the CloudGrid actions as MCP tools.

It ships in two editions from one codebase:

- **Local (stdio)** — runs on your machine, full toolset including the CLI-wrapping
  tools. This README covers it. For Claude Code, Cursor, Claude Desktop.
- **Web (hosted HTTP)** — a light, CLI-free toolset (drop, claim, login) for
  web clients like claude.ai. See [REMOTE.md](REMOTE.md).

The local edition wraps the `cloudgrid` CLI for authenticated operations (the CLI
handles auth, org context, and error formatting) and calls the API directly for the
drop, claim, and login tools.

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
| `cloudgrid_drop` | `POST /api/v2/drop/auto` | Artifact drop. Anonymous, or owned if signed in. No CLI. Direct API. |
| `cloudgrid_claim` | `POST /api/v2/anon-claim` | Claim an anonymous drop into the signed-in account. Direct API. |
| `cloudgrid_login` | `GET /auth/login` | Start a CLI-free sign-in; returns a URL to open. Calls the API directly. |
| `cloudgrid_login_status` | `GET /auth/status` | Finish the sign-in; saves the token to the shared CLI credentials. |
| `cloudgrid_init` | `cloudgrid init` | Register an app or agent; optionally seed a web service. |
| `cloudgrid_plug` | `cloudgrid plug` | Deploy a directory or URL. |
| `cloudgrid_logs` | `cloudgrid logs` | Snapshot of recent logs. Does not stream. |
| `cloudgrid_share` | `cloudgrid visibility set` | Set visibility, default link. |
| `cloudgrid_feedback` | `cloudgrid feedback list` | Read the org feedback feed. |
| `cloudgrid_brain` | `cloudgrid brain refresh` | Re-run the Grid Brain hooks. |

`cloudgrid_drop` and the two `cloudgrid_login` tools are the ones that do not wrap
the CLI — both are about working without it. The anonymous drop has no identity to
manage; login exists to get an identity without the CLI. Both call the API directly.
`cloudgrid_login` writes the same `~/.cloudgrid/credentials` the CLI uses, so the two
share one identity.

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
