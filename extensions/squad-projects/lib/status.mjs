/**
 * Cross-project status overview.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function getStatus(repoRoot, projectFilter) {
  const configPath = join(repoRoot, '.squad', 'projects.json');
  if (!existsSync(configPath)) {
    return { error: 'No .squad/projects.json found. Run squad_projects_init first.' };
  }

  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const projectNames = projectFilter
    ? [projectFilter]
    : Object.keys(config.projects);

  const results = {};

  for (const name of projectNames) {
    const project = config.projects[name];
    if (!project) continue;

    const status = { repos: [] };

    for (const repo of project.repos) {
      const repoId = `${repo.owner}/${repo.repo}`;
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
