/**
 * Route a query to the correct project based on repo names, labels, or keywords.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function routeToProject(repoRoot, query) {
  const configPath = join(repoRoot, '.squad', 'projects.json');
  if (!existsSync(configPath)) {
    return { error: 'No .squad/projects.json found. Run squad_projects_init first.' };
  }

  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const queryLower = query.toLowerCase();

  for (const [name, data] of Object.entries(config.projects)) {
    // Match by project name
    if (name.toLowerCase() === queryLower) {
      return { project: name, matchType: 'project-name', data };
    }

    // Match by repo name
    for (const repo of data.repos) {
      if (repo.repo.toLowerCase() === queryLower ||
          `${repo.owner}/${repo.repo}`.toLowerCase() === queryLower) {
        return { project: name, matchType: 'repo', matchedRepo: `${repo.owner}/${repo.repo}`, data };
      }
    }

    // Match by label
    if (data.labels && data.labels.some(l => l.toLowerCase() === queryLower)) {
      return { project: name, matchType: 'label', data };
    }
  }

  return { error: `No project found matching "${query}".`, suggestion: 'Use squad_projects_list to see available projects.' };
}
