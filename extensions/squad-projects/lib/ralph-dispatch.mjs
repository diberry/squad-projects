/**
 * Cross-repo Ralph dispatch — scan issues across all repos in a project (v2 format).
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { loadConfig, getProjectRepos, listProjectNames } from './config.mjs';

const execFileAsync = promisify(execFile);

export async function ralphDispatch(repoRoot, projectName, labels) {
  const result = loadConfig(repoRoot);
  if (result.error) return result;

  const { config } = result;
  const repos = getProjectRepos(config, projectName);

  if (repos.length === 0) {
    return { error: `Project "${projectName}" not found or has no repos.`, available: listProjectNames(config) };
  }

  const allIssues = [];

  for (const entry of repos) {
    const repoId = entry.repo;
    try {
      const args = ['issue', 'list', '-R', repoId,
        '--state', 'open', '--json', 'number,title,labels,assignees,createdAt',
        '--limit', '20'];

      if (labels) {
        for (const label of labels.split(',').map(l => l.trim())) {
          args.push('--label', label);
        }
      }

      const { stdout } = await execFileAsync('gh', args);
      const issues = JSON.parse(stdout || '[]');
      allIssues.push(...issues.map(i => ({ ...i, repo: repoId })));
    } catch (err) {
      allIssues.push({ repo: repoId, error: err.message });
    }
  }

  return {
    project: projectName,
    totalIssues: allIssues.filter(i => !i.error).length,
    issues: allIssues,
    scannedRepos: repos.map(r => r.repo),
  };
}
