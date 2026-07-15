---
version: 0.1.0
name: drop-zip-file
description: |
  Use when the user hands over a .zip of a site or app to publish - "deploy this
  zip", "I have a zip", "upload my project zip", "publish this archive", "here is
  a folder as a zip". Unpacks the archive, finds the entry point, and deploys the
  files on CloudGrid - never publishes the raw .zip.
allowed-tools: Bash
---

# Deploying a zip file

The user gave you an archive (a static site or app zipped up). Turn it into a
live deploy - do NOT plug the .zip itself (that would just serve a downloadable
archive).

## Flow

1. **Extract the zip** to a working folder.
2. **Find the entry point** - usually `index.html` at the root (or inside a single
   top-level folder; if so, treat that folder as the root). Note any `dist/` or
   build output.
3. **Classify it:**
   - Already-built static files (HTML/CSS/JS/images) -> deploy the folder as-is.
   - A source project with a build step (has `package.json` + a build script) ->
     it is a runtime static build; keep the project root and let the platform
     build it (or build first, then deploy the output).
4. **Deploy the folder** with the plug/deploy tool. Preserve the directory
   structure and relative paths. Binary assets (images) are included as-is.
5. **Return the live URL**, then ask what visibility the user wants.

## Rules and limits

- **Never deploy the `.zip` as a single file** - extract first, deploy the
  contents.
- **Multi-file deploys need the local edition** (Claude Desktop/Code or the CLI).
  On the hosted web edition you cannot build or read a local folder: tell the
  user plainly and offer either a single-page fallback or switching to the local
  edition / CLI.
- Skip junk: `__MACOSX`, `.DS_Store`, `node_modules`, `.git`.
- If it is genuinely a single self-contained HTML page inside the zip, publish
  that page directly as an inspiration (instant, any edition).
- Do not fabricate files the archive does not contain.
