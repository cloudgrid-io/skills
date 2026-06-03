#!/usr/bin/env node
// CloudGrid MCP server.
// Exposes six tools — init, plug, logs, share, feedback, brain — by shelling out
// to the cloudgrid CLI. The CLI handles auth, org context, and error formatting;
// this server does not re-implement any of that. Stateless beyond the CLI's own
// credentials at ~/.cloudgrid/credentials.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

// Public API base. The anonymous drop calls this directly — there is no CLI and
// no login in that path, so there is nothing to read it from.
const API_BASE = (process.env.CLOUDGRID_API_URL || "https://api.cloudgrid.io").replace(/\/+$/, "");

// Anonymous HTML drops are capped at 2 MB by the platform.
const ANON_HTML_MAX_BYTES = 2_000_000;

// Run the cloudgrid CLI with an argument array. No shell, so no injection: args
// are passed to execFile verbatim. Returns trimmed stdout (or stderr) as text.
async function runCloudgrid(args) {
  try {
    const { stdout, stderr } = await execFileAsync("cloudgrid", args, {
      maxBuffer: 16 * 1024 * 1024,
      timeout: 10 * 60 * 1000,
    });
    return (stdout || stderr || "").trim() || "Done.";
  } catch (err) {
    if (err && err.code === "ENOENT") {
      throw new Error(
        "The cloudgrid CLI is not installed. Install it with: npm install -g @cloudgrid-io/cli",
      );
    }
    const detail = [err && err.stdout, err && err.stderr, err && err.message]
      .filter(Boolean)
      .join("\n")
      .trim();
    throw new Error(detail || "cloudgrid command failed");
  }
}

function ok(text) {
  return { content: [{ type: "text", text }] };
}

function fail(text) {
  return { content: [{ type: "text", text }], isError: true };
}

// Wrap a CLI argument builder so every tool shares the same error handling.
function cliTool(buildArgs) {
  return async (input) => {
    try {
      return ok(await runCloudgrid(buildArgs(input || {})));
    } catch (err) {
      return fail(err.message);
    }
  };
}

// True when a string already opens a full HTML document. Fragments get wrapped so
// "drop this snippet" still produces a servable page (the platform rejects
// fragments that do not start with <!doctype/<html>).
function looksLikeFullHtml(s) {
  const head = s.replace(/^﻿/, "").trimStart().slice(0, 256).toLowerCase();
  return head.startsWith("<!doctype html") || head.startsWith("<html");
}

// The anonymous drop. Unlike every other tool here, this does NOT use the CLI:
// the anonymous path has no identity to manage, so it posts straight to the
// public endpoint. Returns the live shareable URL and the claim link.
async function runDrop({ html, path: filePath, filename }) {
  let bytes;
  let name;
  let type;

  if (filePath) {
    bytes = await readFile(filePath);
    name = filename || basename(filePath);
    type = "application/octet-stream"; // server sniffs magic bytes regardless
  } else if (typeof html === "string" && html.length > 0) {
    let content = html;
    if (!looksLikeFullHtml(content)) {
      content =
        `<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8">` +
        `<title>Shared on CloudGrid</title></head>\n<body>\n${content}\n</body>\n</html>\n`;
    }
    bytes = Buffer.from(content, "utf8");
    name = filename || "index.html";
    type = "text/html";
    if (bytes.byteLength > ANON_HTML_MAX_BYTES) {
      throw new Error(
        `This HTML is ${(bytes.byteLength / 1e6).toFixed(2)} MB. Anonymous drops are capped at 2 MB. ` +
          `Trim it, or sign in to publish larger.`,
      );
    }
  } else {
    throw new Error("Provide either `html` (inline content) or `path` (a local file).");
  }

  const form = new FormData();
  form.append("artifact", new Blob([bytes], { type }), name);

  let res;
  try {
    res = await fetch(`${API_BASE}/api/v2/drop/auto`, { method: "POST", body: form });
  } catch (err) {
    throw new Error(`Could not reach CloudGrid at ${API_BASE}: ${err.message}`);
  }

  const raw = await res.text();
  let data = null;
  try {
    data = JSON.parse(raw);
  } catch {
    // leave data null; handled below
  }

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || raw || `HTTP ${res.status}`;
    throw new Error(`Drop failed (HTTP ${res.status}): ${msg}`);
  }

  const lines = [`Live: ${data.url}`];
  if (data.expires_at) {
    lines.push(`Expires ${data.expires_at} — anonymous drops last 7 days.`);
  }
  if (data.claim_url) {
    lines.push(`Sign in to claim it and keep it past 7 days: ${data.claim_url}`);
  }
  return lines.join("\n");
}

const server = new McpServer({ name: "cloudgrid-mcp", version: "0.1.0" });

server.tool(
  "cloudgrid_init",
  "Register a new CloudGrid app or agent, optionally seeding a web service. Wraps `cloudgrid init`.",
  {
    kind: z.enum(["app", "agent"]).describe("Entity kind."),
    name: z.string().describe("Slug: 3-40 lowercase alphanumerics and hyphens."),
    type: z
      .enum(["node", "nextjs", "python", "static"])
      .optional()
      .describe("Seed a web service of this type. Omit to register without files."),
    description: z.string().optional().describe("Initial one-line description."),
    dir: z.string().optional().describe("Target directory. Defaults to ./<name>."),
    org: z.string().optional().describe("Override the active org for this init."),
  },
  cliTool(({ kind, name, type, description, dir, org }) => {
    const args = ["init", kind, name];
    if (type) args.push("--type", type);
    if (description) args.push("--description", description);
    if (dir) args.push("--dir", dir);
    if (org) args.push("--org", org);
    return args;
  }),
);

server.tool(
  "cloudgrid_plug",
  "Build and deploy a directory or URL. Prints the live URL. Wraps `cloudgrid plug`.",
  {
    target: z
      .string()
      .optional()
      .describe("Path or URL. Omit to deploy the entity linked to the current directory."),
    org: z.string().optional().describe("Pick or override the org."),
    no_deploy: z
      .boolean()
      .optional()
      .describe("Register the entity but do not build or deploy."),
  },
  cliTool(({ target, org, no_deploy }) => {
    const args = ["plug"];
    if (target) args.push(target);
    if (org) args.push("--org", org);
    if (no_deploy) args.push("--no-deploy");
    // Keep machine output clean for an agent context.
    args.push("--no-clipboard", "--no-notify");
    return args;
  }),
);

server.tool(
  "cloudgrid_logs",
  "Tail recent logs for an entity. Does not stream; returns a snapshot. Wraps `cloudgrid logs`.",
  {
    name: z
      .string()
      .optional()
      .describe("Entity name. Omit to use the entity linked to the current directory."),
    tail: z.number().int().positive().optional().describe("Number of recent lines. Default 100."),
    since: z.string().optional().describe("Only logs newer than this, e.g. 5m, 1h, 2d."),
  },
  cliTool(({ name, tail, since }) => {
    const args = ["logs"];
    if (name) args.push(name);
    args.push("--tail", String(tail ?? 100));
    if (since) args.push("--since", since);
    // Never --follow: that would never return in a tool call.
    return args;
  }),
);

server.tool(
  "cloudgrid_share",
  "Set an entity's visibility and print its URL. Defaults to link (anyone with the URL). Wraps `cloudgrid visibility set`.",
  {
    name: z.string().describe("Entity slug."),
    mode: z
      .enum(["link", "private", "authenticated", "org", "space"])
      .optional()
      .describe("Visibility mode. Default link."),
  },
  cliTool(({ name, mode }) => ["visibility", "set", name, mode ?? "link"]),
);

server.tool(
  "cloudgrid_feedback",
  "List recent feedback events for the active org. Read-only. Wraps `cloudgrid feedback list`.",
  {
    since: z.string().optional().describe("Only events newer than this, e.g. 24h, 7d."),
    limit: z.number().int().positive().max(200).optional().describe("Number of events. Default 50, max 200."),
    org: z.string().optional().describe("Read another org's feed where you have access."),
  },
  cliTool(({ since, limit, org }) => {
    const args = ["feedback", "list"];
    if (since) args.push("--since", since);
    if (limit) args.push("--limit", String(limit));
    if (org) args.push("--org", org);
    return args;
  }),
);

server.tool(
  "cloudgrid_brain",
  "Re-run an entity's Grid Brain hooks to re-classify its description, tags, and diagram. Wraps `cloudgrid brain refresh`.",
  {
    name: z.string().describe("Entity slug."),
    wait: z.boolean().optional().describe("Wait for the refresh to finish. Default true."),
    org: z.string().optional().describe("Target an entity in another org."),
  },
  cliTool(({ name, wait, org }) => {
    const args = ["brain", "refresh", name];
    if (wait !== false) args.push("--wait");
    if (org) args.push("--org", org);
    return args;
  }),
);

server.tool(
  "cloudgrid_drop",
  "Share an artifact instantly with no login: publish an HTML page (or a file) to CloudGrid and get a public shareable URL. Use when the user wants to share, publish, send, or 'deploy' something and is not signed in, or just wants a link to send a friend. Anonymous: inspirations only, 7-day expiry, claimable later. Calls the API directly; does not use the CLI.",
  {
    html: z
      .string()
      .optional()
      .describe("Inline HTML to publish. A fragment is wrapped into a full document."),
    path: z
      .string()
      .optional()
      .describe("Path to a local file to upload instead of inline HTML."),
    filename: z
      .string()
      .optional()
      .describe("Filename to present. Defaults to index.html for inline HTML."),
  },
  async (input) => {
    try {
      return ok(await runDrop(input || {}));
    } catch (err) {
      return fail(err.message);
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
