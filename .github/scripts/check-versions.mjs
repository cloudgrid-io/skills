#!/usr/bin/env node
// Version-coherence guard.
// Run: node .github/scripts/check-versions.mjs
//
// WHY THIS EXISTS
// ---------------
// This repo had FOUR version declarations, one authority, and zero coupling:
//
//   .claude-plugin/plugin.json  0.14.31  <- what actually ships (marketplace)
//   VERSION                     0.14.0   <- read at RUNTIME by hooks/user-prompt
//   package.json                0.14.0   <- npm (retired channel)
//   skills/*/SKILL.md           0.x.y    <- per-skill semver, independent
//
// The VERSION drift was not cosmetic: hooks/user-prompt reads it and reports it
// as `plugin_version` on every build-intent telemetry event. VERSION froze at
// 0.14.0 on 2026-07-09 while plugin.json advanced 31 patches, so ~17 days of
// telemetry was attributed to a single stale version and no release after
// 0.14.0 was distinguishable in the data.
//
// THE RULE
// --------
// `.claude-plugin/plugin.json` is the SINGLE SOURCE OF TRUTH for the plugin
// version. VERSION and package.json are mirrors of it and must match exactly.
// Per-skill `version:` frontmatter is deliberately INDEPENDENT (each skill
// carries its own semver) and is not checked here — lint-skills.mjs only
// requires the key to be present.
//
// package.json must also stay `private: true`: the npm channel is retired, and
// every documented install path is git-based.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(repoRoot, p), "utf8");
const json = (p) => JSON.parse(read(p));

const failures = [];

const plugin = json(".claude-plugin/plugin.json");
const pkg = json("package.json");
const versionFile = read("VERSION").trim();

const source = plugin.version;
if (!source || !/^\d+\.\d+\.\d+$/.test(source)) {
  failures.push(
    `.claude-plugin/plugin.json version is missing or not x.y.z: ${JSON.stringify(source)}`,
  );
}

if (versionFile !== source) {
  failures.push(
    `VERSION (${versionFile}) != plugin.json (${source}). ` +
      `VERSION is read at runtime by hooks/user-prompt and reported as plugin_version ` +
      `in telemetry — a mismatch silently mislabels every event. Update VERSION.`,
  );
}

if (pkg.version !== source) {
  failures.push(`package.json (${pkg.version}) != plugin.json (${source}). Update package.json.`);
}

if (pkg.private !== true) {
  failures.push(
    `package.json must keep "private": true — the npm channel is retired ` +
      `(last publish 0.14.0, 2026-07-09) and all documented installs are git-based. ` +
      `Removing it re-arms accidental publishing.`,
  );
}

if (failures.length > 0) {
  console.error("Version coherence check FAILED:\n");
  for (const f of failures) console.error(`  - ${f}\n`);
  console.error(
    "Single source of truth: .claude-plugin/plugin.json. Bump it, then mirror into VERSION and package.json.",
  );
  process.exit(1);
}

console.log(`Version coherence OK — plugin.json, VERSION, package.json all at ${source}; npm channel retired.`);
