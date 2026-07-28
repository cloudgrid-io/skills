# Cookbook

Canonical chains you can run end to end. Each step is one skill or one CLI
command. Together they are the "I built a thing and shipped it" loop.

Below, `grid <command>` is shorthand for `npx -y @cloudgrid-io/cli@latest <command>`.

## Prerequisite

You are logged in:

```
npx -y @cloudgrid-io/cli@latest login
```

## The build-and-ship loop

```
brainstorm  ->  build
```

### 1. Brainstorm

Align on the idea, goal, and core features:

```
/cloudgrid:brainstorm
```

Describe what you want ("a task manager with due dates"). The skill confirms the
idea, names the core features, picks the right template, and hands off to `build`.

### 2. Build

Structure the project and take it live:

```
/cloudgrid:build
```

The skill creates `cloudgrid.yaml`, writes the services, and plugs the result
into the grid. It prints the live URL when done. This usually takes about
30 seconds for a single page, longer for a runtime app.

## Share a single page with no account

The fastest path has one step and no login. The `cloudgrid:build` skill and the
`grid_plug` MCP tool (inline `html` param) do this for you — hand the agent an
HTML file or describe what you want and it publishes a public URL. Anonymous
pages expire after 7 days unless claimed.

## Ship an existing directory

From the project directory (must have a `cloudgrid.yaml`):

```
npx -y @cloudgrid-io/cli@latest plug
```

The first plug auto-creates the entity from `cloudgrid.yaml` (honoring its
`name:`) and writes `.cloudgrid/link.json`. Re-plugging updates the same entity
in place — same slug, same URL, new content.

## Notes

- Every command uses the active grid and linked entity when you omit the name.
  Run `npx -y @cloudgrid-io/cli@latest whoami` to see the active context.
- These skills wrap the CLI. Anything the CLI can do, a skill can drive.
