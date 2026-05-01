/**
 * List all projects from .squad/projects.json (v2 format)
 */
import { loadConfig, listProjectNames, getProjectRepos } from './config.mjs';

export function listProjects(repoRoot) {
  const result = loadConfig(repoRoot);
  if (result.error) return result;

  const { config } = result;
  const projectNames = listProjectNames(config);

  const projects = projectNames.map(name => {
    const repos = getProjectRepos(config, name);
    return {
      name,
      repos: repos.map(r => ({ repo: r.repo, tags: r.tags || [], tracking: r.tracking })),
      repoCount: repos.length,
    };
  });

  return {
    activeProject: config.activeProject,
    projects,
    total: projects.length,
  };
}
