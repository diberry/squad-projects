/**
 * Health check for project configuration.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

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
  if (config.version) {
    checks.push({ check: 'version', status: 'pass', message: `v${config.version}` });
  } else {
    checks.push({ check: 'version', status: 'warn', message: 'No version field' });
  }

  // Check projects exist
  const projectCount = Object.keys(config.projects || {}).length;
  if (projectCount > 0) {
    checks.push({ check: 'projects', status: 'pass', message: `${projectCount} project(s) configured` });
  } else {
    checks.push({ check: 'projects', status: 'warn', message: 'No projects configured' });
  }

  // Check each project has repos
  for (const [name, data] of Object.entries(config.projects || {})) {
    if (!data.repos || data.repos.length === 0) {
      checks.push({ check: `project:${name}`, status: 'warn', message: 'No repos registered' });
    } else {
      checks.push({ check: `project:${name}`, status: 'pass', message: `${data.repos.length} repo(s)` });
    }
  }

  const healthy = checks.every(c => c.status !== 'fail');
  return { healthy, checks, summary: healthy ? 'All checks passed.' : 'Issues found.' };
}
