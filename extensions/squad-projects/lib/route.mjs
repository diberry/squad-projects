/**
 * Route a query to the correct project based on repo names, tags, or keywords (v2 format).
 */
import { loadConfig, listProjectNames, getProjectRepos, parseRepoId } from './config.mjs';

export function routeToProject(repoRoot, query) {
  const result = loadConfig(repoRoot);
  if (result.error) return result;

  const { config } = result;
  const queryLower = query.toLowerCase();

  // Match by project name
  const projectNames = listProjectNames(config);
  for (const name of projectNames) {
    if (name.toLowerCase() === queryLower) {
      return { project: name, matchType: 'project-name', repos: getProjectRepos(config, name) };
    }
  }

  // Match by repo identifier
  for (const entry of config.repos || []) {
    const { owner, repo } = parseRepoId(entry.repo);
    if (repo.toLowerCase() === queryLower ||
        entry.repo.toLowerCase() === queryLower) {
      return { project: entry.project, matchType: 'repo', matchedRepo: entry.repo };
    }
  }

  // Match by tag
  for (const entry of config.repos || []) {
    if (entry.tags && entry.tags.some(t => t.toLowerCase() === queryLower)) {
      return { project: entry.project, matchType: 'tag', matchedRepo: entry.repo };
    }
  }

  return { error: `No project found matching "${query}".`, suggestion: 'Use squad_projects_list to see available projects.' };
}
