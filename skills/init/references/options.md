# cloudgrid init — options

```
cloudgrid init <kind> <name> [options]
```

## Arguments

- `<kind>` — `app` or `agent`. An agent is an app with an agent block; same entity
  type, same deploy path.
- `<name>` — slug: 3 to 40 lowercase alphanumerics and hyphens, no leading or
  trailing hyphen.

## Options

- `--type <type>` — seed a web service of this type. One of `node`, `nextjs`,
  `python`, `static`. Omit to register without seeding files.
- `--dir <path>` — target directory for the scaffold. Defaults to `./<name>`.
- `--description <text>` — initial one-line description.
- `--space <slug>` — associate the entity with a space.
- `--org <slug>` — override the active org for this init.
- `--internal` — mark the entity internal-only: the yaml gets `expose: false` and
  the seeded service has no public path.

## The four service types

- `static` — plain HTML, CSS, and assets. No build step.
- `node` — a Node.js service.
- `nextjs` — a Next.js app.
- `python` — a Python service.

## Notes

- `init` registers the entity and optionally writes a starter directory. It does
  not deploy. Run `cloudgrid plug` to deploy.
- The slug must be unique within the org.
