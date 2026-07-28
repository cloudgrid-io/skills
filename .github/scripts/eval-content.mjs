#!/usr/bin/env node
// Behavioral content evals for the skill files.
// Run: npm install --no-save yaml && node .github/scripts/eval-content.mjs
//
// The other CI scripts validate BYTES (frontmatter shape, hashes, version
// strings). This one validates BEHAVIOR at the level CI can reach without an
// LLM: every cloudgrid.yaml example an agent might copy out of a skill is
// checked against the platform contract, and the load-bearing teaching lines
// (the ones that prevent the highest-frequency real-world failures) are
// asserted present. A future edit that adds `path: services/api` to an example
// — the single most common agent mistake — fails here instead of shipping.
//
// Full agent-in-the-loop scenarios live in evals/scenarios.md; this script is
// the deterministic subset that runs on every PR.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

let YAML;
try {
  YAML = (await import("yaml")).default;
} catch {
  console.error("Missing dep: run `npm install --no-save yaml` first (CI does).");
  process.exit(2);
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(repoRoot, p), "utf8");

const failures = [];
const fail = (file, msg) => failures.push(`${file}: ${msg}`);

// ---------------------------------------------------------------------------
// The platform contract the examples must obey (mirrors shared validateConfig
// at the level a skill example exercises; the server re-validates for real).
// ---------------------------------------------------------------------------
const SERVICE_TYPES = new Set(["node", "nextjs", "python", "static", "cron"]);
const NEEDS_VOCAB = new Set(["database", "cache", "kv", "queue", "pubsub", "vector", "disk", "ai"]);
const GATED_NEEDS = new Set(["object_storage"]); // rejected at plug-time (#1678) — never in examples
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,40}[a-z0-9]$/;

/** Extract fenced ```yaml blocks. Blocks containing "WRONG" are deliberate
 *  counter-examples (brainstorm B3 teaches by contrast) and are skipped. */
function yamlBlocks(text) {
  const out = [];
  const re = /```yaml\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (!/WRONG/.test(m[1])) out.push(m[1]);
  }
  return out;
}

function checkManifest(file, doc, raw) {
  // Full manifest: name + services. Fragments (needs-only) checked separately.
  if (doc.name !== undefined) {
    if (typeof doc.name !== "string" || !NAME_RE.test(doc.name)) {
      fail(file, `manifest name ${JSON.stringify(doc.name)} violates the 2-42 char lowercase rule`);
    }
  }
  const services = doc.services ?? {};
  let rootMounts = 0;
  for (const [key, svc] of Object.entries(services)) {
    if (svc == null || typeof svc !== "object") {
      fail(file, `service ${key} is not a mapping`);
      continue;
    }
    if (!NAME_RE.test(key)) fail(file, `service key '${key}' is not a valid name`);
    if (!SERVICE_TYPES.has(svc.type)) {
      fail(file, `service ${key} has unknown type ${JSON.stringify(svc.type)} (allowed: ${[...SERVICE_TYPES].join(", ")})`);
    }
    // THE rule: path is a URL mount ('/...') or false — never a filesystem path.
    if ("path" in svc) {
      const ok = svc.path === false || (typeof svc.path === "string" && svc.path.startsWith("/"));
      if (!ok) {
        fail(file, `service ${key} has path ${JSON.stringify(svc.path)} — path is a URL mount ('/...') or false, never a filesystem path`);
      }
      if (svc.path === "/") rootMounts++;
    }
    if (svc.type === "cron") {
      if (!svc.schedule) fail(file, `cron service ${key} is missing required schedule`);
      if (svc.path !== false && svc.path !== undefined) {
        fail(file, `cron service ${key} must be internal (path: false), got ${JSON.stringify(svc.path)}`);
      }
    }
    if ("depends_on" in svc && !Array.isArray(svc.depends_on)) {
      fail(file, `service ${key} depends_on must be a list`);
    }
    // source.path IS a filesystem path (the override) — assert it is NOT
    // URL-shaped, which would mean the example confused the two fields.
    if (svc.source?.path !== undefined && typeof svc.source.path === "string" && svc.source.path.startsWith("/")) {
      fail(file, `service ${key} source.path '${svc.source.path}' looks like a URL mount — source.path is a relative filesystem path`);
    }
  }
  if (rootMounts > 1) fail(file, `more than one service claims path: / (only one may)`);
  checkNeeds(file, doc.needs);
  // needs can also be scoped per service
  for (const [key, svc] of Object.entries(services)) {
    if (svc && typeof svc === "object" && svc.needs) checkNeeds(file, svc.needs, `service ${key} `);
  }
  void raw;
}

function checkNeeds(file, needs, prefix = "") {
  if (needs === undefined) return;
  if (needs === null || typeof needs !== "object" || Array.isArray(needs)) {
    fail(file, `${prefix}needs must be a mapping`);
    return;
  }
  for (const key of Object.keys(needs)) {
    if (GATED_NEEDS.has(key)) fail(file, `${prefix}needs.${key} is gated (#1678) and must not appear in examples`);
    else if (!NEEDS_VOCAB.has(key)) fail(file, `${prefix}needs.${key} is not in the vocabulary (${[...NEEDS_VOCAB].join(", ")})`);
  }
}

// ---------------------------------------------------------------------------
// 1. Every yaml example in the skill files obeys the contract.
// ---------------------------------------------------------------------------
const YAML_SOURCES = [
  "skills/using-cloudgrid/SKILL.md",
  "skills/brainstorm/SKILL.md",
  "skills/build/SKILL.md",
  "project-skills/sites/SKILL.md",
];

let blockCount = 0;
for (const file of YAML_SOURCES) {
  for (const block of yamlBlocks(read(file))) {
    blockCount++;
    let doc;
    try {
      doc = YAML.parse(block);
    } catch (e) {
      fail(file, `yaml block does not parse: ${e.message.split("\n")[0]}`);
      continue;
    }
    if (doc == null || typeof doc !== "object") continue; // prose-ish block
    if (doc.services !== undefined) checkManifest(file, doc, block);
    else if (doc.needs !== undefined) checkNeeds(file, doc.needs);
    // other fragments (vault:, etc.) have no contract to enforce here
  }
}
if (blockCount === 0) fail("(corpus)", "no yaml blocks found at all — extraction regex is broken");

// ---------------------------------------------------------------------------
// 2. Load-bearing teaching lines. Each maps to a real failure seen in the
//    field or in review; losing one silently re-arms that failure.
// ---------------------------------------------------------------------------
const CONTRACTS = [
  // file, must-contain (string or regex), why
  ["skills/build/SKILL.md", "npx -y @cloudgrid-io/cli@latest", "stale-CLI guard (version-floor errors)"],
  ["skills/build/SKILL.md", /Runtime apps need a local edition/i, "hosted-edition guard (MCP 0.20.37 steer)"],
  ["skills/build/SKILL.md", /grid_check_deploy/, "failure branch — read the build log, don't guess"],
  ["skills/build/SKILL.md", /inside: private\|spaces\|grid/, "visibility vocab accuracy (two-axis model: inside/outside axes; authenticated retired)"],
  ["skills/brainstorm/SKILL.md", /`path:` is the URL mount, NOT the filesystem path/, "the #1 agent mistake"],
  ["skills/brainstorm/SKILL.md", /A resource is never a service/, "the #2 agent mistake"],
  ["skills/brainstorm/SKILL.md", /Say "plug", not "deploy"/, "voice rule with fixed go-live labels"],
  ["project-skills/sites/SKILL.md", "npx -y @cloudgrid-io/cli@latest", "stale-CLI guard"],
  ["skills/using-cloudgrid/SKILL.md", "npx -y @cloudgrid-io/cli@latest", "stale-CLI guard in the session-injected orientation"],
  ["skills/using-cloudgrid/SKILL.md", /grid_start/, "orientation must route through grid_start"],
];
for (const [file, needle, why] of CONTRACTS) {
  const text = read(file);
  const hit = typeof needle === "string" ? text.includes(needle) : needle.test(text);
  if (!hit) fail(file, `missing load-bearing line (${why}): ${needle}`);
}

// Negative contracts: retired names and the stale-global footgun must not return.
const BANNED = [
  [/grid_set_sharing|grid_deploy\b|grid_fork|grid_remix|grid_download|gridctl/, "retired tool/verb names"],
  [/npm install -g @cloudgrid-io\/cli/, "global-install advice (the stale-global footgun)"],
  [/npx -y @cloudgrid-io\/cli(?!@latest)[ `]/, "npx without @latest (cached-stale footgun)"],
];
for (const file of YAML_SOURCES) {
  const text = read(file);
  for (const [re, why] of BANNED) {
    const m = text.match(re);
    if (m) fail(file, `banned pattern (${why}): '${m[0]}'`);
  }
}

// ---------------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`Content evals FAILED (${failures.length}):\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`Content evals OK — ${blockCount} yaml examples obey the platform contract; all load-bearing lines present; no banned patterns.`);
