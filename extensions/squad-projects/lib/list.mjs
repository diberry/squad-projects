/**
 * List all projects from .squad/projects.json
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function listProjects(repoRoot) {
  const configPath = join(repoRoot, '.squad', 'projects.json');
  if (!existsSync(configPath)) {
    return { error: 'No .squad/projects.json found. Run squad_projects_init first.' };
  }

  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const projects = Object.entries(config.projects).map(([name, data]) => ({
    name,
    description: data.description,
    repos: data.repos,
    focus: data.focus || null,
  }));

  return {
    activeProject: config.activeProject,
    projects,
    total: projects.length,
  };
}
