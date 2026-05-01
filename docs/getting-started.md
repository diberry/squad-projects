# Getting Started with squad-projects

## Prerequisites

- Node.js 18+
- An existing [Squad](https://github.com/bradygaster/squad) installation
- GitHub CLI (`gh`) installed and authenticated

## Quick Start

### 1. Install

```bash
npm install @diberry/squad-projects
```

### 2. Setup

Run setup from your Squad repo root:

```bash
npx squad-projects setup
```

This does two things:
1. Copies the Copilot CLI extension to `.github/extensions/squad-projects/`
2. Creates `.squad/projects.json` (v2 format) from your existing `repos.json` (if present)

The init process handles both v1 and v2 input formats automatically.

### 3. Verify

```bash
npx squad-projects doctor
```

You should see all checks passing. If not, add repos manually:

```bash
# Use the tool in a Copilot CLI session
squad_projects_add_repo project="my-project" owner="myorg" repo="my-app"
```

### 4. Use in Copilot CLI

Once installed, the tools are available in any Copilot CLI session:

```
> Which project owns azure-mcp-server?
  → squad_projects_route query="azure-mcp-server"
  → Result: azure-ai-tools (matched by repo name)

> What's happening across all projects?
  → squad_projects_status
  → Result: 3 projects, 12 open issues, 4 open PRs

> Focus on data-plus-ai
  → squad_projects_focus project="data-plus-ai"
  → Result: Active project set to "data-plus-ai"

> Ralph, scan for work
  → squad_projects_ralph_dispatch project="data-plus-ai"
  → Result: 5 open issues across 2 repos
```

## Configuration (v2)

### Repo Fields

Each repo entry in the flat `repos` array has these fields:

| Field | Required | Description |
|-------|----------|-------------|
| `repo` | ✓ | `"owner/repo"` identifier |
| `project` | ✓ | Project this repo belongs to |
| `description` | | Human-readable summary |
| `auth` | | Auth shorthand (`"personal"` or `"emu"`) |
| `tracking` | | `"managed"` (tools write) or `"read-only"` |
| `swept` | | Whether included in sweep operations |
| `tags` | | Array of routing keywords (replaces v1 `role`) |
| `owners` | | Agent routing info |

### Tags

Tags replace v1 `role` and `labels`. Common tags:

| Tag | Meaning |
|-----|---------|
| `source` | Code repository |
| `content` | Documentation/content repo |
| `fork` | Your fork of an upstream repo |
| `samples` | Sample code |

### Owners (Agent Routing)

The `owners` array routes work to specific agents:

```json
"owners": [
  {
    "agent": "casey",
    "scope": { "type": "all", "artifacts": ["issues", "prs"] },
    "primary": true,
    "concern": "content-delivery"
  }
]
```

## Migration from v1

If you have an existing v1 `.squad/projects.json`, delete it and re-run `squad_projects_init`. The init process will convert v1 formats (including the old `{ projects: { ... } }` structure) into the v2 flat array format.

## Next Steps

- [Architecture](./architecture.md) — how the extension works
- [Contributing](../CONTRIBUTING.md) — help improve squad-projects
