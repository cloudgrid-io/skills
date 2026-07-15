---
version: 0.1.0
name: using-custom-domains
description: |
  Use when the user wants an app served on their own domain instead of the
  default cloudgrid.io URL - "custom domain", "my own URL", "point my domain",
  "use example.com", "vanity domain". Adds and verifies a domain with grid
  domains and attaches it to the app.
allowed-tools: Bash
---

# Using custom domains

Serve a deployed app on the user's own domain. This is a CLI flow (local edition)
and needs access to the domain's DNS.

## Flow

1. **The app must be deployed first** - custom domains attach to an existing
   entity. Deploy it and confirm the default `*.cloudgrid.io` URL works.
2. **Add the domain:** `grid domains add <domain>` (for the entity). CloudGrid
   returns the DNS record(s) to create.
3. **Set DNS:** the user adds the record(s) at their DNS provider (CNAME/TXT as
   instructed). This step is on them - you can't do it for them.
4. **Verify:** `grid domains verify <domain>` once DNS has propagated; CloudGrid
   provisions TLS. `grid domains list` shows status; `grid domains remove` detaches.

## Rules

- DNS + TLS take a few minutes to propagate after verify - set that expectation.
- The default `*.cloudgrid.io` URL keeps working alongside the custom domain.
- Don't promise instant availability; guide the user through the add -> DNS ->
  verify steps and check status with `grid domains list`.
