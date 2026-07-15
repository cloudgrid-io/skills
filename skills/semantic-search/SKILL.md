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
3. **Data + AI** - declare `needs: { database: true }` (managed Mongo, injected
   as `DATABASE_MONGODB_URL`) and, for generating embeddings, `needs: { ai: true }`
   (the CloudGrid AI gateway).
4. **Store + query** - embed each document once, store the vector alongside the
   text in Mongo, and rank by cosine similarity at query time.
5. **Deploy** the folder, poll to live, return the URL, then ask visibility.

## Honest limits

- **Native vector search (`vector: pgvector`) is not generally available yet.**
  Store embeddings in Mongo and rank by cosine similarity for now; do not promise
  a managed vector database.
- Embedding dimensions must match between what you store and what you query with -
  use one embedding model consistently.
- A daily refresh can run as a `type: cron` service if the corpus changes.

See `adding-databases` and `adding-ai-features` for the data and AI wiring.
