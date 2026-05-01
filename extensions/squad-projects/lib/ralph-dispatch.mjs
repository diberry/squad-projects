/**
 * Cross-repo Ralph dispatch — scan issues across all repos in a project.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function ralphDispatch(repoRoot, projectName, labels) {
  const configPath = join(repoRoot, '.squad', 'projects.json');
  if (!existsSync(configPath)) {
    return { error: 'No .squad/projects.json found. Run squad_projects_init first.' };
  }

  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const project = config.projects[projectName];

  if (!project) {
    return { error: `Project "${projectName}" not found.`, available: Object.keys(config.projects) };
  }

  const allIssues = [];

  for (const repo of project.repos) {
    try {
      const args = ['issue', 'list', '-R', `${repo.owner}/${repo.repo}`,
        '--state', 'open', '--json', 'number,title,labels,assignees,createdAt',
        '--limit', '20'];

      if (labels) {
        for (const label of labels.split(',').map(l => l.trim())) {
          args.push('--label', label);
        }
      }

      const { stdout } = await execFileAsync('gh', args);
      const issues = JSON.parse(stdout || '[]');
      allIssues.push(...issues.map(i => ({ ...i, repo: `${repo.owner}/${repo.repo}` })));
    } catch (err) {
      allIssues.push({ repo: `${repo.owner}/${repo.repo}`, error: err.message });
    }
  }

  return {
    project: projectName,
    totalIssues: allIssues.filter(i => !i.error).length,
    issues: allIssues,
    scannedRepos: project.repos.map(r => `${r.owner}/${r.repo}`),
  };
}
