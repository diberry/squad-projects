/**
 * Add a repo to a project.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function addRepo(repoRoot, { project, owner, repo, role }) {
  const configPath = join(repoRoot, '.squad', 'projects.json');
  if (!existsSync(configPath)) {
    return { error: 'No .squad/projects.json found. Run squad_projects_init first.' };
  }

  const config = JSON.parse(readFileSync(configPath, 'utf-8'));

  if (!config.projects[project]) {
    // Create project if it doesn't exist
    config.projects[project] = {
      description: '',
      repos: [],
      labels: [project],
      focus: null,
    };
  }

  // Check for duplicates
  const existing = config.projects[project].repos.find(
    r => r.owner === owner && r.repo === repo
  );
  if (existing) {
    return { warning: `${owner}/${repo} is already registered under "${project}".` };
  }

  config.projects[project].repos.push({ owner, repo, role });
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

  return {
    added: `${owner}/${repo}`,
    project,
    role,
    totalRepos: config.projects[project].repos.length,
  };
}
