/**
 * Get or set the active project focus (v2 format).
 */
import { loadConfig, saveConfig, listProjectNames } from './config.mjs';

export function manageFocus(repoRoot, project) {
  const result = loadConfig(repoRoot);
  if (result.error) return result;

  const { config } = result;

  if (!project) {
    return { activeProject: config.activeProject || null };
  }

  const available = listProjectNames(config);
  if (!available.includes(project)) {
    return { error: `Project "${project}" not found.`, available };
  }

  config.activeProject = project;
  saveConfig(repoRoot, config);

  return { activeProject: project, message: `Focus set to "${project}".` };
}
