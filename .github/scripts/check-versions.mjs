#!/usr/bin/env node
// Version-coherence guard.
// Run: node .github/scripts/check-versions.mjs
//
// WHY THIS EXISTS
// ---------------
// This repo declares the plugin version in several places, with one authority:
//
//   plugins/cloudgrid/.claude-plugin/plugin.json  <- what ships (marketplace)
//   VERSION, package.json                        <- mirrors
//   .codex-plugin/plugin.json, .cursor-plugin/plugin.json  <- mirrors
//   plugins/cloudgrid/skills/*/SKILL.md          <- per-skill semver, independent
//
// They drifted before (VERSION froze at 0.14.0 for weeks while plugin.json
// advanced 31 patches), so this check couples them.
//
// THE RULE
// --------
// `plugins/cloudgrid/.claude-plugin/plugin.json` is the SINGLE SOURCE OF TRUTH
// for the plugin version. The mirrors must match exactly. Per-skill `version:`
// frontmatter is deliberately INDEPENDENT (each skill carries its own semver)
// and is not checked here; lint-skills.mjs only requires the key to be present.
//
// package.json is published to npm on a v* tag (see .github/workflows/
// release.yml), so its version must match plugin.json exactly — a published
// package one patch behind the marketplace is the drift this guards against.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(repoRoot, p), "utf8");
const json = (p) => JSON.parse(read(p));

const failures = [];

const plugin = json("plugins/cloudgrid/.claude-plugin/plugin.json");
const pkg = json("package.json");
const versionFile = read("VERSION").trim();

const source = plugin.version;
if (!source || !/^\d+\.\d+\.\d+$/.test(source)) {
  failures.push(
    `plugins/cloudgrid/.claude-plugin/plugin.json version is missing or not x.y.z: ${JSON.stringify(source)}`,
  );
}

if (versionFile !== source) {
  failures.push(
    `VERSION (${versionFile}) != plugin.json (${source}). ` +
      `Update VERSION.`,
  );
}

if (pkg.version !== source) {
  failures.push(`package.json (${pkg.version}) != plugin.json (${source}). Update package.json.`);
}

// Codex and Cursor manifests must track the same version.
for (const manifest of [".codex-plugin/plugin.json", ".cursor-plugin/plugin.json"]) {
  try {
    const m = json(manifest);
    if (m.version !== source) {
      failures.push(
        `${manifest} (${m.version}) != plugin.json (${source}). ` +
          `Update ${manifest} to match.`,
      );
    }
  } catch {
    failures.push(`${manifest} is missing or unreadable.`);
  }
}

if (pkg.private === true) {
  failures.push(
    `package.json must NOT be "private": true — the npm channel is live and a ` +
      `v* tag publishes @cloudgrid-io/skills (.github/workflows/release.yml). ` +
      `private: true makes npm publish hard-fail.`,
  );
}

if (failures.length > 0) {
  console.error("Version coherence check FAILED:\n");
  for (const f of failures) console.error(`  - ${f}\n`);
  console.error(
    "Single source of truth: plugins/cloudgrid/.claude-plugin/plugin.json. Bump it, then mirror into VERSION and package.json.",
  );
  process.exit(1);
}

console.log(`Version coherence OK — plugin.json, VERSION, package.json, codex, cursor all at ${source}; npm channel live.`);
