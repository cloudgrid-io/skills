#!/usr/bin/env node
// Unit tests for the agent-file writer's pure merge functions.
// Run with: node --test bin/write-agent-files.test.mjs
// No dependencies — uses Node's built-in test runner.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeManagedBlock, ensureClaudeImport } from "./write-agent-files.mjs";

const START = "<!-- cloudgrid:start -->";
const END = "<!-- cloudgrid:end -->";
const BLOCK = `${START}\nOUR CONTENT\n${END}`;

test("case 1: create — writes block when file is absent", () => {
  const out = mergeManagedBlock(null, BLOCK);
  assert.ok(out.includes(START) && out.includes(END));
  assert.equal(count(out, START), 1);
});

test("case 1: create — treats empty/whitespace file as create", () => {
  const out = mergeManagedBlock("   \n  ", BLOCK);
  assert.equal(count(out, START), 1);
});

test("case 2: append — keeps user content, adds block below", () => {
  const user = "# User\n\nImportant notes.\n";
  const out = mergeManagedBlock(user, BLOCK);
  assert.ok(out.startsWith("# User"));
  assert.ok(out.includes("Important notes."));
  assert.equal(count(out, START), 1);
});

test("case 3: replace — swaps only our block, keeps content above and below", () => {
  const existing = `TOP\n\n${START}\nSTALE\n${END}\n\nBOTTOM\n`;
  const out = mergeManagedBlock(existing, BLOCK);
  assert.ok(out.includes("TOP"));
  assert.ok(out.includes("BOTTOM"));
  assert.ok(out.includes("OUR CONTENT"));
  assert.ok(!out.includes("STALE"));
  assert.equal(count(out, START), 1);
});

test("idempotent — running twice yields identical output (create)", () => {
  const once = mergeManagedBlock(null, BLOCK);
  const twice = mergeManagedBlock(once, BLOCK);
  assert.equal(once, twice);
});

test("idempotent — running twice yields identical output (append)", () => {
  const user = "# User\n\nNotes.\n";
  const once = mergeManagedBlock(user, BLOCK);
  const twice = mergeManagedBlock(once, BLOCK);
  assert.equal(once, twice);
  assert.equal(count(twice, START), 1);
});

test("ensureClaudeImport — creates file with import when absent", () => {
  const out = ensureClaudeImport(null);
  assert.ok(out.includes("@AGENTS.md"));
});

test("ensureClaudeImport — adds import once, preserves user content", () => {
  const user = "# CLAUDE\n\nGuidance.\n";
  const once = ensureClaudeImport(user);
  assert.ok(once.includes("Guidance."));
  assert.ok(once.includes("@AGENTS.md"));
  const twice = ensureClaudeImport(once);
  assert.equal(once, twice);
  assert.equal(count(twice, "@AGENTS.md"), 1);
});

test("ensureClaudeImport — does not duplicate an existing import", () => {
  const user = "# CLAUDE\n\n@AGENTS.md\n\nMore.\n";
  const out = ensureClaudeImport(user);
  assert.equal(count(out, "@AGENTS.md"), 1);
});

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}
