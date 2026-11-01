# CloudGrid

CloudGrid runs web apps and pages at a live public URL and provides the
infrastructure they need: managed MongoDB, Redis, pgvector, persistent disk, and
an AI gateway that needs no API key. This plugin adds CloudGrid skills to Claude
Code and connects the CloudGrid connector, so Claude can plan an app, structure
it, plug it into a grid, and hand back the live URL.

## What it does

- **A project folder on disk** goes live through the `grid` CLI: `grid plug`
  builds and plugs the folder, `grid logs` reads its logs, `grid secrets set`
  stores a secret, `grid pull` downloads an app's source.
- **Content from the conversation** that is not saved anywhere, such as a single
  HTML page, goes live through the connector's `grid_plug` tool.
- **Account and grid actions** go through the connector: who can see an app
  (`grid_visibility`), collaborators (`grid_collab`), listing and creating grids
  (`grid_list_grids`, `grid_create_grid`), build status (`grid_check_deploy`),
  templates and workflows (`grid_start`, `grid_get_template`), and notes or
  reports to the CloudGrid team (`grid_note`, `grid_report`).

## Skills

| Skill | What it does |
|---|---|
| `cloudgrid:using-cloudgrid` | What CloudGrid does and which route serves which request. |
| `cloudgrid:brainstorm` | Align on the idea, then decide services, folder layout, and `cloudgrid.yaml`. |
| `cloudgrid:build` | Structure the project and plug it into a grid, ending with the live URL. |

## What the plugin runs, sends, and connects to

- **Connects to** the CloudGrid connector at `https://mcp.cloudgrid.io/mcp`, a
  remote MCP server operated by CloudGrid. The plugin starts no local server and
  installs no package.
- **Sends** to CloudGrid only what you ask Claude to plug or send: the page or
  app files, the settings for an app (visibility, collaborators, grid), and the
  text of a note or report. Nothing from the conversation is sent otherwise.
- **Runs** the `grid` CLI on your machine when a project is a folder on disk, and
  only after you install it yourself. The plugin does not install it. To install:
  `brew install cloudgrid-io/tap/grid` (macOS, Linux) or
  `npm install -g @cloudgrid-io/cli` (any platform).
- **Needs** a CloudGrid account to create anything. The connector asks you to sign
  in the first time it is needed.
- The plugin has no hooks and collects no telemetry.

## Install

```
/plugin marketplace add cloudgrid-io/skills
/plugin install cloudgrid@cloudgrid-skills
```

## Support and policies

- Documentation: https://docs.cloudgrid.io
- Support: support@cloudgrid.io
- Privacy: https://cloudgrid.io/privacy (privacy@cloudgrid.io)
- Terms: https://cloudgrid.io/terms (legal@cloudgrid.io)
- Source and issues: https://github.com/cloudgrid-io/skills

## License

MIT. See [LICENSE](LICENSE).
