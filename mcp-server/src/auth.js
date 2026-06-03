// CLI-free sign-in against CloudGrid's existing OAuth backend.
//
// The flow is the same one `cloudgrid login` uses, driven without the CLI:
//   1. pick a UUID `code`
//   2. user opens GET /auth/login?code=<code> and signs in with Google
//   3. poll GET /auth/status?code=<code> until it returns the signed JWT (once)
//   4. write the JWT to ~/.cloudgrid/credentials in the CLI's format, so the CLI
//      and the MCP share one identity.
//
// No new identity provider, no localhost callback, no CLI dependency.

import { randomUUID } from "node:crypto";
import { mkdir, writeFile, chmod } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const API_BASE = (process.env.CLOUDGRID_API_URL || "https://api.cloudgrid.io").replace(/\/+$/, "");

export function cloudgridHome() {
  return process.env.CLOUDGRID_HOME || join(homedir(), ".cloudgrid");
}

export function credentialsPath() {
  return join(cloudgridHome(), "credentials");
}

export function newLoginCode() {
  return randomUUID();
}

export function buildLoginUrl(code) {
  return `${API_BASE}/auth/login?code=${encodeURIComponent(code)}`;
}

// One poll. Returns { status: 'not_started' | 'pending' | 'authenticated' | 'expired', jwt? }.
// A 404 means the session for this code does not exist yet — the user has not
// opened the sign-in URL — so it is reported as 'not_started', not an error.
export async function pollStatusOnce(code) {
  const res = await fetch(`${API_BASE}/auth/status?code=${encodeURIComponent(code)}`);
  if (res.status === 404) {
    return { status: "not_started" };
  }
  if (!res.ok) {
    throw new Error(`Sign-in status check failed: HTTP ${res.status}`);
  }
  return res.json();
}

// Decode a JWT payload without verifying it — only to populate the credentials
// file's email/user_id fields. The server verifies the token on every use.
export function decodeJwt(jwt) {
  try {
    const part = jwt.split(".")[1];
    const json = Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return {};
  }
}

// Write the JWT to ~/.cloudgrid/credentials in the CLI's exact shape and 0600.
export async function writeCredentials(jwt) {
  const claims = decodeJwt(jwt);
  const creds = {
    jwt,
    issued_at: new Date().toISOString(),
    email: claims.email ?? null,
    user_id: claims.sub ?? null,
  };
  await mkdir(cloudgridHome(), { recursive: true });
  const path = credentialsPath();
  await writeFile(path, JSON.stringify(creds, null, 2) + "\n", { mode: 0o600 });
  await chmod(path, 0o600); // enforce even if the file pre-existed
  return creds;
}
