/**
 * Cross-project status overview (v2 format).
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { loadConfig, listProjectNames, getProjectRepos } from './config.mjs';

const execFileAsync = promisify(execFile);

export async function getStatus(repoRoot, projectFilter) {
  const result = loadConfig(repoRoot);
  if (result.error) return result;

  const { config } = result;
  const projectNames = projectFilter
    ? [projectFilter]
    : listProjectNames(config);

  const results = {};

  for (const name of projectNames) {
    const repos = getProjectRepos(config, name);
    if (repos.length === 0) continue;

    const status = { repos: [] };

    for (const entry of repos) {
      const repoId = entry.repo;
      try {
        const { stdout: issueOut } = await execFileAsync('gh', [
          'issue', 'list', '-R', repoId, '--state', 'open',
          '--json', 'number', '--limit', '50'
        ]);
        const { stdout: prOut } = await execFileAsync('gh', [
          'pr', 'list', '-R', repoId, '--state', 'open',
          '--json', 'number,isDraft,reviewDecision', '--limit', '20'
        ]);

        const issues = JSON.parse(issueOut || '[]');
        const prs = JSON.parse(prOut || '[]');

        status.repos.push({
          repo: repoId,
          openIssues: issues.length,
          openPRs: prs.length,
          draftPRs: prs.filter(p => p.isDraft).length,
          approvedPRs: prs.filter(p => p.reviewDecision === 'APPROVED').length,
        });
      } catch (err) {
        status.repos.push({ repo: repoId, error: err.message });
      }
    }

    results[name] = status;
  }

  return { activeProject: config.activeProject, projects: results };
}
