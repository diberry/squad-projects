# Multi-Terminal Workflow

How to run squad-projects across multiple terminals for parallel project work.

## The Pattern

Each project gets its own terminal session. Ralph dispatches across all of them.

```
┌─────────────────────────────────────────────────────┐
│  Terminal 1: azure-ai-tools                         │
│  $ squad-projects focus azure-ai-tools             │
│  $ # then: "Ralph, go" in Copilot CLI              │
│  → Ralph monitors issues/PRs for this project      │
├─────────────────────────────────────────────────────┤
│  Terminal 2: data-plus-ai                           │
│  $ squad-projects focus data-plus-ai               │
│  $ # then: "Ralph, go" in Copilot CLI              │
│  → Ralph monitors issues/PRs for this project      │
├─────────────────────────────────────────────────────┤
│  Terminal 3: dispatch (all projects)                │
│  $ # no focus set — Copilot CLI sees all projects  │
│  → Ralph scans ALL projects, routes to correct one │
└─────────────────────────────────────────────────────┘
```

## Launching a Project Terminal

```bash
# Focus on one project — Ralph only sees repos in that project
squad-projects focus azure-ai-tools

# Check which project is active
squad-projects status

# Clear focus to enter dispatch mode (cross-project)
squad-projects focus --clear
```

When you set focus, the session:
1. Sets the active project in `.squad/projects.json`
2. Scopes all `gh` queries to that project's repos
3. Ralph only monitors issues/PRs for those repos

Then start a Copilot CLI session and say "Ralph, go" — it will respect the focused project.

## Dispatch Mode

Without a focused project, the extension operates in dispatch mode:

- `squad_projects_ralph_dispatch` scans ALL projects for open work
- Routes findings to the correct project based on repo ownership
- Reports cross-project status in one view

Use dispatch mode when you want a single terminal overseeing everything.

## Which Mode to Use

| Situation | Mode |
|-----------|------|
| Deep work on one project | `squad-projects focus {name}` |
| Morning triage across everything | dispatch (no focus set) |
| Running Ralph unattended | dispatch — covers all projects |
| Pair-programming in one repo | `squad-projects focus {name}` |

## How Ralph Coordinates

In **project mode** (focus set), Ralph runs its standard work-check cycle scoped to that project's repos only.

In **dispatch mode** (no focus), Ralph uses `squad_projects_ralph_dispatch` which:
1. Iterates all projects in `projects.json`
2. For each project, scans repos for untriaged issues, open PRs, CI failures
3. Groups findings by project
4. Reports the full board, then processes highest-priority items

## Example Session

```
# Terminal 1 — focused project work
$ squad-projects focus azure-ai-tools
✅ Active project: azure-ai-tools

# Then in Copilot CLI:
> Ralph, go
🔄 Ralph scanning azure-ai-tools repos...
  🟡 #142 needs triage in azure-mcp-server
  🟢 PR #88 approved, ready to merge
```

```
# Terminal 2 — dispatch overview (no focus set)
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
- Each terminal is just a Copilot CLI session — the extension tools are available in all of them
