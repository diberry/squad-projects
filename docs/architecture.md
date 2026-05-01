# Architecture

## Extension Pattern

squad-projects follows the [sabbour companion extension pattern](https://sabbour.me/2026/04/30/building-software-with-squad-governance-layers.html):

```
┌─────────────────────────────────────────────┐
│ Copilot CLI                                  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Squad Coordinator (squad.agent.md)     │  │
│  │                                        │  │
│  │  calls squad_projects_* tools ──────────┼──┼──┐
│  └────────────────────────────────────────┘  │  │
│                                              │  │
│  ┌────────────────────────────────────────┐  │  │
│  │ .github/extensions/squad-projects/     │◄─┼──┘
│  │                                        │  │
│  │  extension.mjs                         │  │
│  │    └── joinSession() registers tools   │  │
│  │    └── tools call lib/*.mjs modules    │  │
│  └────────────────────────────────────────┘  │
│                                              │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────┐    ┌──────────────┐
│ .squad/projects.json │    │ gh CLI       │
│ (state)              │    │ (GitHub API) │
└─────────────────────┘    └──────────────┘
```

## Data Flow

1. **Tool Registration:** `extension.mjs` calls `joinSession()` from `@github/copilot-sdk/extension`, registering 8 tools with JSON Schema parameters.

2. **Tool Invocation:** When the coordinator or an agent calls a tool (e.g., `squad_projects_route`), the SDK invokes the handler function.

3. **Handler Logic:** Each handler imports from `lib/`, reads `.squad/projects.json`, and returns JSON.

4. **GitHub Integration:** Tools like `ralph_dispatch` and `status` shell out to `gh` CLI for cross-repo issue/PR queries.

## Module Map

```
extensions/squad-projects/
├── extension.mjs        # Entry point — tool registration
└── lib/
    ├── config.mjs       # Shared config helper (loadConfig, saveConfig, helpers)
    ├── list.mjs         # List all projects
    ├── route.mjs        # Route query → project
    ├── focus.mjs        # Get/set active project
    ├── ralph-dispatch.mjs # Cross-repo issue scan
    ├── status.mjs       # Cross-project status
    ├── init.mjs         # Initialize projects.json (handles v1 + v2 input)
    ├── doctor.mjs       # Health checks
    └── add-repo.mjs     # Add repo to project
```

## State Format (v2)

All state lives in `.squad/projects.json`. No database, no external dependencies.

```jsonc
{
  "version": "2.0",                // Schema version
  "github_accounts": {             // Auth shorthand → GitHub username
    "personal": "myuser",
    "emu": "myuser_microsoft"
  },
  "repos": [                       // Flat array of all repos
    {
      "repo": "owner/repo-name",   // Slash-separated identifier
      "project": "project-name",   // Which project this repo belongs to
      "description": "",           // Human-readable summary
      "auth": "personal",          // Which github_accounts key to use
      "tracking": "managed",       // "managed" or "read-only"
      "swept": true,               // Included in sweep operations?
      "tags": ["source"],          // Routing keywords (replaces v1 role/labels)
      "owners": [...]              // Optional agent routing
    }
  ],
  "activeProject": null            // Session-scoped active project
}
```

Projects are **derived** from the `project` field on each repo — there is no separate projects object.

## CLI vs Extension

The package provides two entry points:

| Entry | Path | Purpose |
|-------|------|---------|
| CLI | `bin/squad-projects.mjs` | Human-facing setup and diagnostics |
| Extension | `extensions/squad-projects/extension.mjs` | Agent-facing tool registration |

Both share the same `lib/` modules — no code duplication.
