---
version: 0.1.0
name: semantic-search
description: |
  Use when the user wants search over their own content by meaning - "semantic
  search", "search my documents/notes/PDFs", "find across my files", "a
  searchable knowledge base", "embeddings", "vector search". Builds an embed +
  store + rank-by-meaning app on CloudGrid with managed data.
allowed-tools: Bash
---

# Semantic search

The user wants to search their content by meaning, not just keywords: embed
documents, store them, and rank results by similarity to a query. This is a
runtime app backed by managed data (local edition, async deploy).

## Flow

1. **Confirm the shape** (see `brainstorming-app-ideas` if fuzzy): what content
   (notes, docs, PDFs, product descriptions), how it gets in, and where it is
   searched from.
2. **Start from the pattern** - fetch the `semantic-search` recipe/template:
   `grid_fetch({ kind: "workflow", name: "semantic-search" })` then its template.
   Prefer the recipe over hand-rolling embedding + storage glue.
3. **Data + AI** - declare `needs: { vector: pgvector }` for the embeddings (managed
   pgvector; the platform injects `VECTOR_PGVECTOR_URL`) and `needs: { ai: true }`
   to generate them (the CloudGrid AI gateway). Add `needs: { database: true }`
   (Mongo, `DATABASE_MONGODB_URL`) if you also store app data/metadata.
4. **Store + query** - embed each document once, store the vector in pgvector, and
   rank by vector similarity at query time (an ANN/`<->` search) - semantic search
   out of the box.
5. **Deploy** the folder, poll to live, return the URL, then ask visibility.

## Notes

- **Managed pgvector is available on the Pool tier** (the default) via
  `needs: { vector: pgvector }`. Bring-your-own also works (Supabase / Neon /
  Atlas) via an external secret. Dedicated-tier vector HA is still hardening, but
  that does not block building on Pool.
- Embedding dimensions must match between what you store and what you query with -
  use one embedding model consistently (declare `dim` if you want it enforced).
- A daily refresh can run as a `type: cron` service if the corpus changes.

See `adding-databases` and `adding-ai-features` for the data and AI wiring.
