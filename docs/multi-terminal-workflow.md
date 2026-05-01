# Multi-Terminal Workflow

How to run squad-projects across multiple terminals for parallel project work.

## The Pattern

Each project gets its own terminal. Ralph dispatches across all of them.

```
┌─────────────────────────────────────────────────────┐
│  Terminal 1: azure-ai-tools                         │
│  $ start.ps1 --project azure-ai-tools              │
│  → Ralph monitors issues/PRs for this project      │
├─────────────────────────────────────────────────────┤
│  Terminal 2: data-plus-ai                           │
│  $ start.ps1 --project data-plus-ai                │
│  → Ralph monitors issues/PRs for this project      │
├─────────────────────────────────────────────────────┤
│  Terminal 3: dispatch (all projects)                │
│  $ start.ps1                                       │
│  → Ralph scans ALL projects, routes to correct one │
└─────────────────────────────────────────────────────┘
```

## Launching a Project Terminal

```powershell
# Focus on one project — Ralph only sees repos in that project
./start.ps1 --project azure-ai-tools

# No --project flag = dispatch mode (cross-project)
./start.ps1
```

When you launch with `--project`, the session:
1. Sets the active project in `.squad/projects.json`
2. Scopes all `gh` queries to that project's repos
3. Ralph only monitors issues/PRs for those repos

## Dispatch Mode

Without `--project`, start.ps1 runs in dispatch mode:

- `squad_projects_ralph_dispatch` scans ALL projects for open work
- Routes findings to the correct project based on repo ownership
- Reports cross-project status in one view

Use dispatch mode when you want a single terminal overseeing everything.

## Which Mode to Use

| Situation | Mode |
|-----------|------|
| Deep work on one project | `--project {name}` |
| Morning triage across everything | dispatch (no flag) |
| Running Ralph unattended | dispatch — covers all projects |
| Pair-programming in one repo | `--project {name}` |

## How Ralph Coordinates

In **project mode**, Ralph runs its standard work-check cycle scoped to that project's repos only.

In **dispatch mode**, Ralph uses `squad_projects_ralph_dispatch` which:
1. Iterates all projects in `projects.json`
2. For each project, scans repos for untriaged issues, open PRs, CI failures
3. Groups findings by project
4. Reports the full board, then processes highest-priority items

## Example Session

```
# Terminal 1 — focused project work
PS> ./start.ps1 --project azure-ai-tools
🎯 Active project: azure-ai-tools (3 repos)
Ralph monitoring: azure-mcp-server, azure-mcp-docs, azure-dev-docs-pr

> Ralph, go
🔄 Ralph scanning azure-ai-tools repos...
  🟡 #142 needs triage in azure-mcp-server
  🟢 PR #88 approved, ready to merge
```

```
# Terminal 2 — dispatch overview
PS> ./start.ps1
📊 Dispatch mode — monitoring all 3 projects (8 repos)

> Ralph, status
🔄 Ralph — Cross-Project Board
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  azure-ai-tools:  2 issues, 1 PR ready
  data-plus-ai:    clear
  squad-infra:     1 draft PR stalled
```

## Tips

- **Don't run dispatch + project terminals for the same project** — you'll get duplicate work
- **Dispatch is best for "Ralph, go"** — it sees everything, processes in priority order
- **Project terminals are best for focused coding** — less noise, faster context
- Terminals are independent sessions — they don't share state beyond `projects.json` on disk
