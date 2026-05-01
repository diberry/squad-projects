/**
 * Add a repo to a project (v2 format).
 */
import { loadConfig, saveConfig, getProjectRepos } from './config.mjs';

export function addRepo(repoRoot, { project, owner, repo, role, auth, tracking }) {
  const result = loadConfig(repoRoot);
  if (result.error) return result;

  const { config } = result;

  // Build the "owner/repo" identifier
  const repoId = `${owner}/${repo}`;

  // Check for duplicates
  const existing = (config.repos || []).find(r => r.repo === repoId && r.project === project);
  if (existing) {
    return { warning: `${repoId} is already registered under "${project}".` };
  }

  if (!config.repos) config.repos = [];

  const entry = {
    repo: repoId,
    project,
    description: '',
    auth: auth || 'personal',
    tracking: tracking || 'read-only',
    swept: false,
    tags: role ? [role] : ['source'],
  };

  config.repos.push(entry);
  saveConfig(repoRoot, config);

  return {
    added: repoId,
    project,
    tags: entry.tags,
    totalRepos: getProjectRepos(config, project).length,
  };
}
