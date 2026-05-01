/**
 * Initialize .squad/projects.json (v2) from repos.json or manual input.
 * Handles both v1 and v2 input formats for backward compatibility.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { saveConfig, listProjectNames } from './config.mjs';

export function initProjects(repoRoot, source) {
  const configPath = join(repoRoot, '.squad', 'projects.json');

  if (existsSync(configPath)) {
    return { warning: '.squad/projects.json already exists. Use squad_projects_add_repo to modify.' };
  }

  // Try to read from repos.json
  const reposJsonPath = source || join(repoRoot, 'repos.json');
  let repos = [];

  if (existsSync(reposJsonPath)) {
    const reposData = JSON.parse(readFileSync(reposJsonPath, 'utf-8'));

    if (Array.isArray(reposData)) {
      // v2 flat array with project field, OR v1 flat array without
      repos = reposData.map(r => convertRepoEntry(r));
    } else if (reposData.repos && Array.isArray(reposData.repos)) {
      // v2 format with root repos array (already in target shape)
      repos = reposData.repos.map(r => convertRepoEntry(r));
    } else if (reposData.projects) {
      // v1 format: { projects: { name: { repos: [...] } } }
      for (const [projectName, projectData] of Object.entries(reposData.projects)) {
        for (const r of projectData.repos || []) {
          repos.push({
            repo: r.owner && r.repo ? `${r.owner}/${r.repo}` : r.repo,
            project: projectName,
            description: '',
            auth: 'personal',
            tracking: 'read-only',
            swept: false,
            tags: r.role ? [r.role] : (r.tags || ['source']),
          });
        }
      }
    } else {
      // Object keyed by repo name (legacy format)
      for (const [key, val] of Object.entries(reposData)) {
        const owner = val.owner || key.split('/')[0];
        const repo = val.repo || key.split('/')[1] || key;
        repos.push({
          repo: `${owner}/${repo}`,
          project: 'default',
          description: val.description || '',
          auth: 'personal',
          tracking: 'read-only',
          swept: false,
          tags: val.role ? [val.role] : ['source'],
        });
      }
    }
  }

  const config = {
    version: '2.0',
    github_accounts: {},
    repos,
    activeProject: null,
  };

  saveConfig(repoRoot, config);
  const projects = listProjectNames(config);

  return {
    created: configPath,
    projects,
    message: `Initialized with ${repos.length} repo(s) across ${projects.length} project(s).`,
  };
}

/** Convert a single repo entry from any format to v2 shape. */
function convertRepoEntry(r) {
  // Already v2: has "repo" as "owner/repo" string and "project" field
  if (r.project && r.repo && r.repo.includes('/')) {
    return {
      repo: r.repo,
      project: r.project,
      description: r.description || '',
      auth: r.auth || 'personal',
      tracking: r.tracking || 'read-only',
      swept: r.swept || false,
      tags: r.tags || [],
      ...(r.owners ? { owners: r.owners } : {}),
    };
  }

  // v1: has separate owner/repo fields
  const owner = r.owner || r.org || '';
  const repo = r.repo || r.name || '';
  const repoId = owner ? `${owner}/${repo}` : repo;

  return {
    repo: repoId,
    project: r.project || 'default',
    description: r.description || '',
    auth: r.auth || 'personal',
    tracking: r.tracking || 'read-only',
    swept: r.swept || false,
    tags: r.role ? [r.role] : (r.tags || ['source']),
  };
}
