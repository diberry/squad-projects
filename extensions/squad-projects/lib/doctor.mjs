/**
 * Health check for project configuration (v2 format).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { listProjectNames, getProjectRepos } from './config.mjs';

export function runDoctor(repoRoot) {
  const checks = [];

  // Check .squad/projects.json exists
  const configPath = join(repoRoot, '.squad', 'projects.json');
  if (!existsSync(configPath)) {
    checks.push({ check: 'projects.json', status: 'fail', message: 'File not found. Run squad_projects_init.' });
    return { healthy: false, checks, summary: 'No project configuration found.' };
  }
  checks.push({ check: 'projects.json', status: 'pass', message: 'Found' });

  // Parse and validate
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, 'utf-8'));
    checks.push({ check: 'json-valid', status: 'pass', message: 'Valid JSON' });
  } catch (err) {
    checks.push({ check: 'json-valid', status: 'fail', message: `Invalid JSON: ${err.message}` });
    return { healthy: false, checks, summary: 'Configuration file is corrupted.' };
  }

  // Check version
  if (config.version === '2.0') {
    checks.push({ check: 'version', status: 'pass', message: 'v2.0' });
  } else if (config.version) {
    checks.push({ check: 'version', status: 'warn', message: `v${config.version} (expected 2.0)` });
  } else {
    checks.push({ check: 'version', status: 'warn', message: 'No version field' });
  }

  // Check repos array exists
  if (!Array.isArray(config.repos)) {
    checks.push({ check: 'repos', status: 'fail', message: 'Missing repos array (v2 format required)' });
    return { healthy: false, checks, summary: 'Invalid v2 config — missing repos array.' };
  }

  // Check projects derived from repos
  const projectNames = listProjectNames(config);
  if (projectNames.length > 0) {
    checks.push({ check: 'projects', status: 'pass', message: `${projectNames.length} project(s) configured` });
  } else {
    checks.push({ check: 'projects', status: 'warn', message: 'No projects found (repos have no project field)' });
  }

  // Check each project has repos
  for (const name of projectNames) {
    const repos = getProjectRepos(config, name);
    checks.push({ check: `project:${name}`, status: 'pass', message: `${repos.length} repo(s)` });
  }

  // Check each repo has required fields
  for (const entry of config.repos) {
    if (!entry.repo) {
      checks.push({ check: 'repo-entry', status: 'fail', message: 'Repo entry missing "repo" field' });
    }
    if (!entry.project) {
      checks.push({ check: `repo:${entry.repo || '?'}`, status: 'warn', message: 'Missing project assignment' });
    }
  }

  const healthy = checks.every(c => c.status !== 'fail');
  return { healthy, checks, summary: healthy ? 'All checks passed.' : 'Issues found.' };
}
