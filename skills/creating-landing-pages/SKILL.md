---
version: 0.1.0
name: creating-landing-pages
description: |
  Use when the user wants a landing page or marketing page - "landing page",
  "marketing page", "product/hero page", "coming soon", "link in bio", "event
  page". Builds a single self-contained page and deploys it instantly on
  CloudGrid to a live, shareable URL.
allowed-tools: Bash
---

# Creating landing pages

A landing page is the `landing-page` archetype (or `saas-marketing` for a longer
multi-section site with pricing/testimonials/FAQ): a single self-contained HTML
page, so it publishes instantly as an inspiration on ANY edition - no build, no
account required.

## Flow

1. Nail the goal in a sentence: what it's selling and the primary call to action.
2. Fetch the template: `grid_fetch("template", "landing-page")` (or
   `saas-marketing`). Fill it with the user's copy, sections, and CTA.
3. Keep it one self-contained file - CSS and JS inline, images as data URIs; no
   external scripts, fonts, or CDNs.
4. `grid_deploy` inline via the `html` param - instant, returns the live URL.
5. On a new deploy, ask what visibility the user wants (link to share, etc.).

## Rules

- A waitlist/email-capture form is static; actually STORING signups needs a
  runtime app (`needs: { database: true }`) - say so if they want to collect them.
- Iterate by re-deploying the same entity so the URL stays stable.
