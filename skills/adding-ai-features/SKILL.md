---
version: 0.1.0
name: adding-ai-features
description: |
  Use when an app needs an LLM - "add AI", "chatbot", "AI assistant", "summarize
  / generate / classify with AI", "ask questions over content". Wires the
  CloudGrid AI gateway into an app via needs: { ai: true } - no API key to manage.
allowed-tools: Bash
---

# Adding AI features

CloudGrid ships a managed **AI gateway**: declare `needs: { ai: true }` and the
platform injects the gateway connection - the app calls the model through the
gateway with **no API key to obtain, store, or bill** yourself.

## Wire it

1. `needs: { ai: true }` in `cloudgrid.yaml` (add `database: true` if the app also
   stores data - e.g. a chatbot that remembers conversations).
2. Call the gateway via the runtime SDK: `@cloudgrid-io/runtime` (`runtime.ai.*`)
   is canonical; the older `@cloudgrid-io/ai` (`createClient().chat({ messages })`)
   still works as a compatibility shim. No `apiKey` argument - the gateway handles
   auth.
3. This is a runtime app (built + deployed): local edition, async deploy. See
   `building-cloudgrid-apps`.

## Fits

- The `ai-app` archetype (chatbot) is the ready starting point:
  `grid_fetch("template", "ai-app")`.
- For search-over-your-content (RAG / embeddings) see `semantic-search`.

## Rules

- Never set or hardcode an AI API key - the gateway injects access via `needs: { ai: true }`.
- Keep prompts as visible string literals; read any stored data lazily.
