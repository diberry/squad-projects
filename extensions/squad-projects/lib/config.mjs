/**
 * Shared config helper for v2 .squad/projects.json format.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const CONFIG_REL_PATH = join('.squad', 'projects.json');

/**
 * Load and parse .squad/projects.json
 * @param {string} repoRoot
 * @returns {{ config: object, configPath: string } | { error: string }}
 */
export function loadConfig(repoRoot) {
  const configPath = join(repoRoot, CONFIG_REL_PATH);
  if (!existsSync(configPath)) {
    return { error: 'No .squad/projects.json found. Run squad_projects_init first.' };
  }
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  return { config, configPath };
}

/**
 * Save config back to .squad/projects.json
 * @param {string} repoRoot
 * @param {object} config
 */
export function saveConfig(repoRoot, config) {
  const configPath = join(repoRoot, CONFIG_REL_PATH);
  const dir = dirname(configPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  return configPath;
}

/**
 * Get repos belonging to a specific project.
 * @param {object} config - parsed v2 config
 * @param {string} projectName
 * @returns {Array} repos for that project
 */
export function getProjectRepos(config, projectName) {
  return (config.repos || []).filter(r => r.project === projectName);
}

/**
 * Get unique project names derived from repo entries.
 * @param {object} config - parsed v2 config
 * @returns {string[]}
 */
export function listProjectNames(config) {
  const names = new Set((config.repos || []).map(r => r.project).filter(Boolean));
  return [...names];
}

/**
 * Parse "owner/repo" string into { owner, repo }.
 * @param {string} repoString - e.g. "microsoft/azure-mcp-server"
 * @returns {{ owner: string, repo: string }}
 */
export function parseRepoId(repoString) {
  const idx = repoString.indexOf('/');
  if (idx === -1) return { owner: '', repo: repoString };
  return { owner: repoString.slice(0, idx), repo: repoString.slice(idx + 1) };
}
