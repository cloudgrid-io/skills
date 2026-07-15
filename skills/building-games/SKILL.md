---
version: 0.1.0
name: building-games
description: |
  Use when the user wants a playable browser game - "create a game", "make a
  game", "build me an arcade/puzzle/reflex game", "a fun game". Builds a
  self-contained HTML/canvas game (no dependencies) and deploys it on CloudGrid
  to a live, shareable URL.
allowed-tools: Bash
---

# Building games

The user wants something playable in the browser. A game is the `web-app`
archetype: interactive, client-side, a single self-contained HTML file, so it
publishes instantly as an inspiration on any edition.

## Flow

1. **Nail the game in a sentence** (see `brainstorming-app-ideas` if fuzzy):
   genre, goal, controls. Offer a concrete default ("a catch-the-falling-stars
   arcade game, mouse or arrow keys") so a non-technical user can just say yes.
2. **Build one self-contained HTML file** - all CSS and JS inline, no external
   scripts, fonts, or CDNs; images as data URIs. Use a `<canvas>` and
   `requestAnimationFrame`. Include: a start screen, score, a lose condition,
   and a restart. Make it work with mouse, touch, and keyboard.
3. **Deploy** with the plug/deploy tool (single HTML page -> inspiration,
   instant, any edition). No database needed for a client-side game.
4. **Return the live URL** and invite them to play. On a new deploy, ask what
   visibility they want (link to share, or private) and set it.

## Rules

- Keep it genuinely fun and immediately playable - not a stub.
- No dependencies and no build step for a single-file game (it deploys instantly).
- If the game must save high scores across users, that is a runtime app with
  `needs: { database: true }` - say so and switch to the data flow.
- To change the game later, re-deploy the same entity so the URL stays stable.
