# cloudgrid plug — options

```
cloudgrid plug [target] [options]
```

`[target]` is an optional path or URL. With no target, plug uses the entity linked
to the current directory.

## Common options

- `--existing <entity-id>` — bind this directory to an existing entity, then plug.
- `--org <slug>` — pick the org on the first plug, or override the active org.
- `--no-deploy` — register the entity but do not build or deploy (init semantics).
- `--display-name <text>` — override the human-readable label.
- `--json` — machine-readable output, one line, no progress chrome.
- `--no-clipboard` — do not copy the resulting URL to the clipboard.
- `--no-notify` — skip the OS notification when the deploy reaches a final state.
- `--no-progress` — skip the live build progress lines.

## URL inspirations

Passing a URL deploys it as an inspiration rather than building a directory. These
options apply only in that mode:

- `--scope <scope>` — `personal`, `space`, or `org`.
- `--space <slug>` — required when `--scope space`.
- `--visibility <visibility>` — `private`, `space`, `org`, or `link`.
- `--name <slug>` — override the auto-derived slug.
- `--expires <days|never>` — default 30 days.
- `--pin-reason <text>` — required if `--expires never`.

## Notes

- A directory deploy needs a `cloudgrid.yaml`. `cloudgrid init` writes one, or plug
  will help create one on first run.
- The first plug in an org may prompt for the org. `--org` skips the prompt.
- Output ends with the live URL. In `--json` mode the URL is a field, not chrome.
