/**
 * Get or set the active project focus.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function manageFocus(repoRoot, project) {
  const configPath = join(repoRoot, '.squad', 'projects.json');
  if (!existsSync(configPath)) {
    return { error: 'No .squad/projects.json found. Run squad_projects_init first.' };
  }

  const config = JSON.parse(readFileSync(configPath, 'utf-8'));

  if (!project) {
    return { activeProject: config.activeProject || null };
  }

  if (!config.projects[project]) {
    return { error: `Project "${project}" not found.`, available: Object.keys(config.projects) };
  }

  config.activeProject = project;
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

  return { activeProject: project, message: `Focus set to "${project}".` };
}
