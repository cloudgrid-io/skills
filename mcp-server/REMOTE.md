# Web edition (hosted MCP)

The MCP server ships in two editions from one codebase. The tool logic lives in
`src/tools.js`; each edition is a thin entrypoint that injects an identity context.

| | Local (`src/index.js`) | Web (`src/web.js`) |
|---|---|---|
| Transport | stdio | MCP Streamable HTTP |
| Runs | as a subprocess on the user's machine | hosted (e.g. GKE) |
| Reaches | Claude Code, Cursor, Claude Desktop | claude.ai web, any HTTP MCP client |
| Tools | full set, incl. CLI-wrapping | light set: drop, claim, login |
| Identity | `~/.cloudgrid/credentials` | per-session token in memory |

The web edition omits the CLI-wrapping tools (init, plug, logs, share, feedback,
brain) — those need a local machine. It keeps the direct-API tools, which need no
local environment.

## Run it

```
PORT=8080 npm run start:web      # from a clone
```

- `POST /mcp` — the MCP Streamable HTTP endpoint (one transport per session).
- `GET /mcp`, `DELETE /mcp` — SSE stream and session close.
- `GET /healthz` — liveness for the host.

Smoke test (spawns the server, connects an HTTP client, drops anonymously):

```
npm run smoke:web
```

## Container

```
docker build -t cloudgrid-mcp-web .
docker run -p 8080:8080 cloudgrid-mcp-web
```

The image carries no `cloudgrid` CLI — the web edition never calls it. It serves on
`PORT` (default 8080) and answers `GET /healthz`.

## Deploying (platform)

Hosting is platform work (GKE): a Deployment + Service + Ingress at a stable host
(e.g. `mcp.cloudgrid.io`), `PORT=8080`, `GET /healthz` as the probe. The container
is stateless; sessions live in memory, so a single replica is simplest first, or a
sticky-session ingress for more.

## Identity on the web

A hosted server cannot read a local credentials file, so each session signs in
through the server:

1. `cloudgrid_login` returns the sign-in URL (no browser auto-open on a server).
2. The user completes Google sign-in.
3. `cloudgrid_login_status` polls and holds the token in the session.

Anonymous drop needs no sign-in and works immediately.

## Launch follow-ups

- **Anonymous-drop cap.** Anonymous drops are capped per IP. A shared host sends
  them from one IP, so the cap is hit quickly across users. This needs a platform
  affordance (a trusted-server key that relaxes the cap with its own controls) —
  see the platform backlog.
- **Transport-level OAuth.** For a native "Connect" experience in claude.ai, the
  server can implement the MCP OAuth flow rather than the in-tool login. Follow-up.
- **CORS / DNS-rebinding / allowed hosts.** Configure at deploy time for the public
  host.
