# @diberry/squad-projects

Copilot CLI extension for multi-project/multi-repo Squad management.

Adds `squad_projects_*` tools that give any existing Squad multi-project coordination capabilities — project routing, cross-repo Ralph dispatch, and work coordination.

## Pattern

This follows the [sabbour companion extension pattern](https://sabbour.me/2026/04/30/building-software-with-squad-governance-layers.html) — a Copilot CLI extension that layers on top of Squad, registering tools the coordinator and agents can call.

## Installation

```bash
# Install the package
npm install @diberry/squad-projects

# Run setup (copies extension + creates config)
npx squad-projects setup
```

Or manually copy `extensions/squad-projects/` to `.github/extensions/squad-projects/` in your repo.

## Tools

| Tool | Description |
|------|-------------|
| `squad_projects_list` | List all projects with their repos |
| `squad_projects_route` | Determine which project owns a repo/issue |
| `squad_projects_focus` | Get/set active project for this session |
| `squad_projects_ralph_dispatch` | Scan issues across all repos in a project |
| `squad_projects_status` | Cross-project activity overview |
| `squad_projects_init` | One-time setup from repos.json |
| `squad_projects_doctor` | Validate project configuration |
| `squad_projects_add_repo` | Register a repo under a project |

## CLI

```bash
squad-projects setup       # Copy extension + init config
squad-projects doctor      # Health check
squad-projects status      # Cross-project overview
squad-projects list        # List all projects
```

## Configuration (v2)

Projects are stored in `.squad/projects.json` using the v2 flat-array format:

```json
{
  "version": "2.0",
  "github_accounts": {
    "personal": "myuser",
    "emu": "myuser_microsoft"
  },
  "repos": [
    {
      "repo": "myorg/my-app",
      "project": "my-project",
      "description": "My awesome app",
      "auth": "personal",
      "tracking": "managed",
      "swept": true,
      "tags": ["source"],
      "owners": [
        {
          "agent": "casey",
          "scope": { "type": "all", "artifacts": ["issues", "prs"] },
          "primary": true,
          "concern": "content-delivery"
        }
      ]
    },
    {
      "repo": "myorg/my-docs",
      "project": "my-project",
      "description": "Documentation",
      "auth": "emu",
      "tracking": "read-only",
      "swept": false,
      "tags": ["content"]
    }
  ],
  "activeProject": "my-project"
}
```

Key features of v2:
- **Flat repos array** — projects are derived from the `project` field on each repo
- **`github_accounts`** — maps auth shorthand (personal/emu) to GitHub usernames
- **`repo`** — slash-separated `"owner/repo"` identifier
- **`tags`** — replaces v1 `role` and `labels` fields
- **`owners`** — agent routing info (agent name, scope, concern)
- **`tracking`** — `"managed"` or `"read-only"` (whether tools write to this repo)
- **`swept`** — whether the repo is included in sweep operations

## Integration with squad-identity

If `@sabbour/squad-identity` is installed, tools auto-resolve bot tokens for cross-repo GitHub API calls. Without it, tools fall back to `gh` CLI auth.

## License

MIT
