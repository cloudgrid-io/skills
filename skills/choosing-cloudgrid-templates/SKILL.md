---
version: 0.1.0
name: choosing-cloudgrid-templates
description: |
  Use to match what the user wants to one of CloudGrid's built-in templates
  before building from scratch - "is there a template for X", "what template
  should I use", "start from a template". Maps the intent to a template slug,
  its data needs, deploy path, and edition.
allowed-tools: Bash
---

# Choosing CloudGrid templates

CloudGrid ships a large template library. Always check for a fit before building
from scratch - it is faster and encodes the correct CloudGrid wiring.

## How to choose

1. Call `grid_start` to get the workflow index, or fetch the map:
   `grid_fetch({ kind: "doc", name: "capability-map" })`.
2. Match the user's request against each template's `when:` triggers.
3. Read the row's `needs:`, deploy path (inspiration = instant vs runtime =
   async), and edition (all vs local) so you set expectations correctly.
4. Fetch it: `grid_fetch({ kind: "template", name: "<slug>" })`, then fill it.

## Rough guide

- **Static, instant (any edition):** `landing-page`, `saas-marketing`,
  `docs-site`, `docs-app`, `api-docs`, `status-page`, `changelog`, `portfolio`,
  `waitlist`, `web-app`, `dashboard`, `report`, `presentation`,
  `product-launch`, `company-website`.
- **Runtime, data-backed (local edition):** `app-with-data`, `api-service`,
  `ai-app`, the dashboard family, CRUD/business apps, and heavier blueprints
  (e-commerce, booking, LMS, forums, and more).

If nothing fits, build from the closest archetype rather than truly from zero.
See `using-cloudgrid-recipes` for reusable data/auth/AI patterns.
