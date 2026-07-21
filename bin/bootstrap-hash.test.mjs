#!/usr/bin/env node
// Bootstrap drift tripwire.
// Run with: node --test bin/bootstrap-hash.test.mjs
// No dependencies — uses Node's built-in test runner.
//
// The CloudGrid bootstrap sentence now lives in TWO places:
//   1. hooks/session-start            (prose form, single-line bash string)
//   2. monorepo CLI                   (packages/cli/src/lib/agent-files.ts)
//
// Canonical source is the monorepo CLI packages/cli/src/lib/agent-files.ts
// AGENT_BOOTSTRAP_BLOCK. If this fails, the bootstrap drifted — re-sync the
// hook and CLI and update this hash.
//
// The invariant is the SENTENCE, not the bytes: the hook copy is prose-shaped
// and the CLI copy is markdown-shaped, so we normalize whitespace (collapse all
// runs of whitespace/newlines to single spaces, trim) before hashing.

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
  "4342088ee85b5fa4c6f98b5f81d2e430f3c6deb83f90c3942111d78fff8ac9f7";

/** Collapse all whitespace runs to single spaces and trim. */
function normalize(s) {
  return s.replace(/\s+/g, " ").trim();
}

/** Extract the prose bootstrap sentence from the SessionStart hook. */
function bootstrapFromHook() {
  const hook = readFileSync(join(repoRoot, "hooks", "session-start"), "utf8");
  const m = hook.match(/bootstrap="((?:[^"\\]|\\.)*)"/);
  assert.ok(m, "hooks/session-start: could not find bootstrap=\"...\" assignment");
  // In the bash double-quoted string the backticks around grid_start are
  // escaped as \`; unescape them so the sentence matches the markdown form.
  return m[1].replace(/\\`/g, "`");
}

test("normalized bootstrap sentence matches the recorded sha256", () => {
  const hook = normalize(bootstrapFromHook());
  const hash = createHash("sha256").update(hook).digest("hex");
  assert.equal(
    hash,
    RECORDED_SHA256,
    "bootstrap drifted — re-sync hook and monorepo CLI (packages/cli/src/lib/agent-files.ts), then update RECORDED_SHA256 here and in the CLI's counterpart test",
  );
});
