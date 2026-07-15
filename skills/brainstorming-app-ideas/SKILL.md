---
version: 0.1.0
name: brainstorming-app-ideas
description: |
  Use when the user wants to build an app, game, website, dashboard, landing
  page, tool, MVP, or product but the idea is not yet pinned down - "build me
  an app", "I have an idea", "turn this into a product", "help me think this
  through". Runs a short, friendly brainstorm to lock the idea before building
  on CloudGrid, without asking technical questions a non-technical user cannot
  answer.
allowed-tools: Bash
---

# Brainstorming app ideas

The user wants to build something, but the idea is fuzzy. Do not jump to
generating or deploying. Take one lightweight beat to align, then hand off to
`planning-cloudgrid-apps` and build.

Keep it human and short. Two or three plain questions at most. Offer options,
never demand specs.

## The beat

1. **Idea in a sentence.** "So this is a `<thing>` that lets `<who>` do `<what>`
   - right?" Confirm or adjust.
2. **Who it is for and the main goal.** One line. ("For your class, to collect
   RSVPs.")
3. **Core features.** The 3-5 things it must do. Suggest a starter set and let
   them trim.
4. **Complexity read (you decide, do not ask).** Is it a single static page, an
   interactive tool, or does it need to save data / accounts / AI? Infer this
   from the features.

## Rules

- Never ask about databases, runtimes, frameworks, or hosting. Infer them and
  state the plan in plain words ("I'll set it up so entries are saved").
- If the request is already clear and simple (a landing page, a poster, a quick
  calculator), skip brainstorming and go straight to building.
- Do not over-scope. Land the smallest version that delivers the core goal; more
  can be added after it is live.
- End by summarizing the idea in 2-3 bullets and moving to a short plan.

Next: `planning-cloudgrid-apps` to turn the idea into a build plan, then build on
CloudGrid and return the live URL.
