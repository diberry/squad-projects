/**
 * Initialize .squad/projects.json from repos.json or manual input.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

export function initProjects(repoRoot, source) {
  const configPath = join(repoRoot, '.squad', 'projects.json');

  if (existsSync(configPath)) {
    return { warning: '.squad/projects.json already exists. Use squad_projects_add_repo to modify.' };
  }

  // Try to read from repos.json
  const reposJsonPath = source || join(repoRoot, 'repos.json');
  let projects = {};

  if (existsSync(reposJsonPath)) {
    const reposData = JSON.parse(readFileSync(reposJsonPath, 'utf-8'));

    // Handle various repos.json formats
    if (Array.isArray(reposData)) {
      // Flat array of repos — create a single "default" project
      projects.default = {
        description: 'Imported from repos.json',
        repos: reposData.map(r => ({
          owner: r.owner || r.org,
          repo: r.repo || r.name,
          role: r.role || 'source',
        })),
        labels: [],
        focus: null,
      };
    } else if (reposData.projects) {
      // Already structured by project
      projects = reposData.projects;
    } else {
      // Object keyed by repo name
      projects.default = {
        description: 'Imported from repos.json',
        repos: Object.entries(reposData).map(([key, val]) => ({
          owner: val.owner || key.split('/')[0],
          repo: val.repo || key.split('/')[1] || key,
          role: val.role || 'source',
        })),
        labels: [],
        focus: null,
      };
    }
  } else {
    // Create empty config
    projects.default = {
      description: 'Default project',
      repos: [],
      labels: [],
      focus: null,
    };
  }

  const config = {
    version: '1.0.0',
    projects,
    activeProject: null,
  };

  const dir = dirname(configPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

  return {
    created: configPath,
    projects: Object.keys(projects),
    message: `Initialized with ${Object.keys(projects).length} project(s).`,
  };
}
