# Contributing to squad-projects

## Development Setup

```bash
git clone https://github.com/diberry/squad-projects.git
cd squad-projects
npm install  # (no deps currently — just devDeps if added)
```

## Running Tests

```bash
npm test
```

Tests use Node.js built-in test runner (`node --test`).

## Adding a New Tool

1. Create `extensions/squad-projects/lib/{tool-name}.mjs` with your exported function
2. Register the tool in `extensions/squad-projects/extension.mjs`:
   - Add to the `tools` array in `joinSession()`
   - Define `name`, `description`, `parameters` (JSON Schema), and `handler`
3. Add a CLI command in `bin/squad-projects.mjs` if it makes sense for human use
4. Update `squad-projects/SKILL.md` with the new tool
5. Add tests in `test/{tool-name}.test.mjs`
6. Update README.md tool table

## Code Style

- ES modules (`import`/`export`)
- No build step — runs directly on Node.js 18+
- Keep dependencies minimal (prefer `node:*` built-ins)
- Each lib module exports named functions (no default exports)
- Handlers return plain objects (JSON-serializable)

## Pull Requests

- One feature per PR
- Include tests for new tools
- Update docs if adding/changing tools
