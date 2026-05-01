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
2. Creates `.squad/projects.json` from your existing `repos.json` (if present)

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

## Configuration

### Project Roles

Each repo in a project has a `role`:

| Role | Meaning |
|------|---------|
| `source` | Code repository (issues tracked here) |
| `content` | Documentation/content repo |
| `docs` | Published documentation |
| `fork` | Your fork of an upstream repo |
| `config` | Configuration or infrastructure |

### Labels

Project labels help with routing. When someone mentions "azure" or "mcp", the router checks labels to find the right project.

### Focus

The `focus` field is a free-text string describing what the team is currently working on for that project. It helps agents understand context without reading all issues.

## Next Steps

- [Architecture](./architecture.md) — how the extension works
- [Contributing](../CONTRIBUTING.md) — help improve squad-projects
