# Examples

## projects.json (v2)

The current v2 project configuration format showing:
- Flat repos array with `project` field for grouping
- `github_accounts` for auth shorthand mapping
- `tags` for routing (replaces v1 `labels`)
- `owners` for agent routing
- `auth`, `tracking`, `swept` fields

Copy to `.squad/projects.json` and customize for your repos.

## legacy-repos.json (v1)

The legacy v1 flat repo list format. `squad_projects_init` can still import this
format and auto-convert to v2. Kept for backward compatibility reference.
