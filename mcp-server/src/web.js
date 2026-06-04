// CloudGrid MCP server — web edition (HTTP, hosted).
//
// The same tool core as the local edition, served over the MCP Streamable HTTP
// transport so web clients (claude.ai) can connect by URL with nothing installed.
// The light, CLI-free toolset only: drop, claim, login. Identity is a per-session
// token held in memory for the life of the MCP session (no local files on a
// shared host).
//
// Run: PORT=8080 node src/web.js     Health: GET /healthz

import { randomUUID } from "node:crypto";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { registerTools, decodeJwt } from "./tools.js";

const PORT = Number(process.env.PORT || 8080);

// A web session: identity lives in memory for the session's lifetime only.
function makeWebContext() {
  let sessionToken = null;
  return {
    edition: "web",
    state: { pendingLoginCode: null, lastAnonClaim: null },
    canOpenBrowser: false,
    getToken: async () => sessionToken,
    // No local config on a shared host. The user passes `org`, or the API returns
    // the list of orgs to choose from.
    getActiveOrg: async () => null,
    saveToken: async (jwt) => {
      sessionToken = jwt;
      return decodeJwt(jwt);
    },
    savedLocationNote: () => "You are signed in for this session.",
  };
}

const app = express();
app.use(express.json({ limit: "8mb" }));

app.get("/healthz", (_req, res) => res.json({ ok: true, edition: "web" }));

// One transport per MCP session, keyed by the session id.
const transports = Object.create(null);

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  let transport = sessionId ? transports[sessionId] : undefined;

  if (!transport) {
    if (sessionId || !isInitializeRequest(req.body)) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "No valid session. Send an initialize request first." },
        id: null,
      });
      return;
    }
    // New session: fresh server + per-session identity context.
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        transports[sid] = transport;
      },
    });
    transport.onclose = () => {
      if (transport.sessionId) delete transports[transport.sessionId];
    };
    const server = new McpServer({ name: "cloudgrid-mcp-web", version: "0.2.0" });
    registerTools(server, makeWebContext());
    await server.connect(transport);
  }

  await transport.handleRequest(req, res, req.body);
});

// SSE stream (GET) and session close (DELETE) reuse the same transport.
async function handleSessionRequest(req, res) {
  const sessionId = req.headers["mcp-session-id"];
  const transport = sessionId ? transports[sessionId] : undefined;
  if (!transport) {
    res.status(400).send("Invalid or missing session id");
    return;
  }
  await transport.handleRequest(req, res);
}

app.get("/mcp", handleSessionRequest);
app.delete("/mcp", handleSessionRequest);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.error(`cloudgrid-mcp web edition listening on :${PORT} (POST /mcp, GET /healthz)`);
});
