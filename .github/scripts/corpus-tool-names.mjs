#!/usr/bin/env node
// Corpus edition-safety guard.
//
// The corpus is served on BOTH the local and hosted MCP editions, but only 14
// tool names exist on both. Any other `grid_*` name in corpus prose causes a
// hosted agent to call a tool it does not have.
//
// This script extracts every `grid_[a-z_]+` token from corpus and skill prose
// and fails if any is NOT in the shared allowlist.
//
// The allowlist mirrors the web-edition registration in cloudgrid-io/mcp
// src/tools/register.js (everything before the local-only gate). The existing
// corpus-drift.mjs keeps the two repos' twinned paths in sync.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const SHARED = new Set([
  "grid_check_deploy",
  "grid_create_grid",
  "grid_get_app_source",
  "grid_get_template",
  "grid_list_grids",
  "grid_login",
  "grid_login_status",
  "grid_note",
  "grid_pickup",
  "grid_plug",
  "grid_pull",
  "grid_report",
  "grid_start",
  "grid_visibility",
]);

// Scan: twinned corpus paths + skills + root SKILL.md + troubleshooting + rules
const SCAN_DIRS = [
  "workflows",
  "templates",
  "examples",
  "rules",
  "troubleshooting",
  "skills",
];
const SCAN_FILES = [
  "capability-map.md",
  "cloudgrid-yaml.md",
  "skills/using-cloudgrid/SKILL.md",
];

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".") || entry === "node_modules") continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".md")) out.push(p);
  }
  return out;
}

const files = [];
for (const d of SCAN_DIRS) files.push(...walk(d));
for (const f of SCAN_FILES) if (existsSync(f)) files.push(f);

const RE = /\bgrid_[a-z_]+\b/g;
const violations = [];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let m;
    while ((m = RE.exec(lines[i])) !== null) {
      const name = m[0];
      if (!SHARED.has(name)) {
        violations.push({ file: relative(".", file), line: i + 1, name });
      }
    }
  }
}

if (violations.length) {
  console.error("Corpus edition-safety violation: non-shared tool names in corpus/skill prose.\n");
  console.error("The corpus is served on both editions. Only the 14 shared tool names");
  console.error("may appear as bare grid_* tokens. Use CLI text (`grid <verb>`) for local-only");
  console.error("commands, or mark them explicitly as local MCP only.\n");
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.name}`);
  }
  console.error(`\n${violations.length} violation(s).`);
  process.exit(1);
}

console.log(`Corpus edition-safety: ${files.length} files scanned, all tool names are shared-14.`);
