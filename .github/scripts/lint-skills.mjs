#!/usr/bin/env node
// SKILL.md frontmatter linter.
// Validates that every <skill>/SKILL.md has well-formed frontmatter with the
// required keys, a cloudgrid- name, and no emoji or exclamation marks in
// user-facing fields. No dependencies — runs on a stock Node.
//
// Exit 0 if all SKILL.md files pass (zero files is a pass). Exit 1 otherwise.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// H8 (review 2026-07-27): `allowed-tools` was REMOVED from every skill — with
// only Bash listed, hosts that enforce it blocked the skills' own instructions
// (they tell the agent to call grid_* MCP tools). Absent = no restriction,
// which is the intent. The key must NOT reappear.
const REQUIRED_KEYS = ["version", "name", "description"];
const BANNED_KEYS = ["allowed-tools"];
const VOICE_FIELDS = ["name", "description"];
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/u;

// Skills live under skills/ (the layout Claude Code plugins require). Each skill
// is a directory there with a SKILL.md.
function findSkillFiles(root) {
  const out = [];
  // skills/ = the plugin surface; project-skills/ = per-project drops written
  // by `grid agent` (not installed globally). Both are linted.
  for (const bucket of ["skills", "project-skills"]) {
    const skillsDir = join(root, bucket);
    let entries;
    try {
      entries = readdirSync(skillsDir);
    } catch {
      continue; // bucket absent
    }
    for (const entry of entries) {
      if (entry.startsWith(".")) continue;
      const dir = join(skillsDir, entry);
      if (!statSync(dir).isDirectory()) continue;
      const skill = join(dir, "SKILL.md");
      try {
        if (statSync(skill).isFile()) out.push(skill);
      } catch {
        // directory has no SKILL.md — not a skill dir, skip
      }
    }
  }
  return out;
}

// Minimal frontmatter reader: pulls top-level "key:" names from the block
// between the first pair of --- fences. Sufficient to check presence + values.
function parseFrontmatter(text, errors) {
  const lines = text.split(/\r?\n/);
  if (lines[0].trim() !== "---") {
    errors.push("missing opening --- frontmatter fence on line 1");
    return null;
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) {
    errors.push("missing closing --- frontmatter fence");
    return null;
  }
  const fields = {};
  let currentKey = null;
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (/^\s/.test(line)) {
      // continuation of a block scalar (e.g. description: |)
      if (currentKey) fields[currentKey] += " " + line.trim();
      continue;
    }
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    currentKey = m[1];
    let value = m[2].trim();
    if (value === "|" || value === ">") value = "";
    fields[currentKey] = value;
  }
  return fields;
}

function lintFile(path) {
  const errors = [];
  const text = readFileSync(path, "utf8");
  const fields = parseFrontmatter(text, errors);
  if (!fields) return errors;

  for (const key of REQUIRED_KEYS) {
    if (!(key in fields)) errors.push(`missing required key: ${key}`);
  }
  for (const key of BANNED_KEYS) {
    if (key in fields) errors.push(`banned key: ${key} — removed repo-wide (H8): a restrictive tool list blocks the skill's own grid_* instructions on enforcing hosts`);
  }

  // Skill names are short (e.g. plug); the CloudGrid brand comes from the plugin
  // namespace at install time — /cloudgrid:plug — exactly like superpowers.

  for (const key of VOICE_FIELDS) {
    const value = fields[key];
    if (value === undefined) continue;
    if (value.trim() === "") errors.push(`${key} is empty`);
    if (value.includes("!")) errors.push(`${key} contains an exclamation mark`);
    if (EMOJI.test(value)) errors.push(`${key} contains an emoji`);
  }

  return errors;
}

const root = process.cwd();
const files = findSkillFiles(root);

if (files.length === 0) {
  console.log("No SKILL.md files found yet. Nothing to lint.");
  process.exit(0);
}

let failed = 0;
for (const file of files) {
  const errors = lintFile(file);
  const rel = file.slice(root.length + 1);
  if (errors.length === 0) {
    console.log(`ok   ${rel}`);
  } else {
    failed++;
    console.log(`FAIL ${rel}`);
    for (const e of errors) console.log(`     - ${e}`);
  }
}

if (failed > 0) {
  console.log(`\n${failed} SKILL.md file(s) failed linting.`);
  process.exit(1);
}
console.log(`\nAll ${files.length} SKILL.md file(s) passed.`);
