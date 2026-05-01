---
name: "squad-projects"
description: "Multi-project/multi-repo management for Squad"
domain: "project routing, cross-repo dispatch, work coordination"
confidence: "high"
---

# Squad Projects

Use this skill for multi-project and multi-repo coordination.

## Tools

- `squad_projects_list` — show all projects and their repos
- `squad_projects_route` — determine which project owns a repo/issue
- `squad_projects_focus` — get/set active project for this session
- `squad_projects_ralph_dispatch` — scan all repos in a project for issues
- `squad_projects_status` — cross-project activity overview
- `squad_projects_init` — one-time setup from existing repos.json
- `squad_projects_doctor` — validate project configuration
- `squad_projects_add_repo` — register a repo under a project

## When to use

- User mentions a project name → call `squad_projects_focus`
- Ralph needs to scan issues → call `squad_projects_ralph_dispatch`
- Ambiguous which repo to work in → call `squad_projects_route`
- Status across projects → call `squad_projects_status`
