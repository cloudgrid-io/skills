#!/usr/bin/env node
// Bootstrap drift tripwire.
// Run with: node --test bin/bootstrap-hash.test.mjs
// No dependencies — uses Node's built-in test runner.
//
// The CloudGrid bootstrap sentence now lives in THREE places:
//   1. hooks/session-start            (prose form, single-line bash string)
//   2. bin/write-agent-files.mjs      (markdown form, inside the managed block)
//   3. monorepo CLI                   (packages/cli/src/lib/agent-files.ts)
//
// Canonical source is the monorepo CLI packages/cli/src/lib/agent-files.ts
// AGENT_BOOTSTRAP_BLOCK. If this fails, the bootstrap drifted — re-sync all
// three (hook, bin, CLI) and update this hash.
//
// The invariant is the SENTENCE, not the bytes: the hook copy is prose-shaped
// and the bin copy is markdown-shaped, so we normalize whitespace (collapse all
// runs of whitespace/newlines to single spaces, trim) before comparing/hashing.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

// The recorded, canonical hash of the normalized bootstrap sentence.
// Keep in sync with the monorepo CLI's counterpart test.
const RECORDED_SHA256 =
  "c5fcdea2626b3d6dd60835d8bc96d7262067dbf559577330bf4f8a2ae74fa689";

/** Collapse all whitespace runs to single spaces and trim. */
function normalize(s) {
  return s.replace(/\s+/g, " ").trim();
}

/** Extract the prose bootstrap sentence from the SessionStart hook. */
function bootstrapFromHook() {
  const hook = readFileSync(join(repoRoot, "hooks", "session-start"), "utf8");
  const m = hook.match(/bootstrap="((?:[^"\\]|\\.)*)"/);
  assert.ok(m, "hooks/session-start: could not find bootstrap=\"...\" assignment");
  // In the bash double-quoted string the backticks around gridctl_start are
  // escaped as \`; unescape them so the sentence matches the markdown form.
  return m[1].replace(/\\`/g, "`");
}

/** Extract the bootstrap sentence from the bin writer's BOOTSTRAP block. */
function bootstrapFromBin() {
  const bin = readFileSync(
    join(repoRoot, "bin", "write-agent-files.mjs"),
    "utf8",
  );
  const m = bin.match(/const BOOTSTRAP = `([\s\S]*?)`;/);
  assert.ok(m, "bin/write-agent-files.mjs: could not find BOOTSTRAP template");
  return (
    m[1]
      // Strip the template-literal marker references and the managed-block markers.
      .replace(/\$\{START\}/g, "")
      .replace(/\$\{END\}/g, "")
      // Strip the markdown heading — it's presentation, not the sentence.
      .replace(/##\s*CloudGrid/, "")
      // Unescape the backticks around gridctl_start.
      .replace(/\\`/g, "`")
  );
}

test("bootstrap sentence is identical in the hook and the bin writer", () => {
  const hook = normalize(bootstrapFromHook());
  const bin = normalize(bootstrapFromBin());
  assert.equal(
    hook,
    bin,
    "hooks/session-start and bin/write-agent-files.mjs disagree on the bootstrap sentence",
  );
});

test("normalized bootstrap sentence matches the recorded sha256", () => {
  const hook = normalize(bootstrapFromHook());
  const bin = normalize(bootstrapFromBin());
  // Both normalize to the same string (asserted above); hash either.
  assert.equal(hook, bin);
  const hash = createHash("sha256").update(hook).digest("hex");
  assert.equal(
    hash,
    RECORDED_SHA256,
    "bootstrap drifted — re-sync hook, bin, and monorepo CLI (packages/cli/src/lib/agent-files.ts), then update RECORDED_SHA256 here and in the CLI's counterpart test",
  );
});
