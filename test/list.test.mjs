import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listProjects } from '../extensions/squad-projects/lib/list.mjs';
import { manageFocus } from '../extensions/squad-projects/lib/focus.mjs';
import { routeToProject } from '../extensions/squad-projects/lib/route.mjs';
import { addRepo } from '../extensions/squad-projects/lib/add-repo.mjs';
import { loadConfig, listProjectNames, getProjectRepos, parseRepoId } from '../extensions/squad-projects/lib/config.mjs';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const TMP = join(tmpdir(), 'squad-projects-test-' + Date.now());

function makeV2Config() {
  return {
    version: '2.0',
    github_accounts: { personal: 'testuser' },
    repos: [
      {
        repo: 'org/app',
        project: 'test-project',
        description: 'Test app',
        auth: 'personal',
        tracking: 'managed',
        swept: true,
        tags: ['source'],
      },
      {
        repo: 'org/docs',
        project: 'test-project',
        description: 'Test docs',
        auth: 'personal',
        tracking: 'read-only',
        swept: false,
        tags: ['content'],
      },
      {
        repo: 'other/lib',
        project: 'other-project',
        description: 'Other lib',
        auth: 'personal',
        tracking: 'read-only',
        swept: false,
        tags: ['source'],
      },
    ],
    activeProject: 'test-project',
  };
}

function writeTmpConfig(config) {
  mkdirSync(join(TMP, '.squad'), { recursive: true });
  writeFileSync(join(TMP, '.squad', 'projects.json'), JSON.stringify(config, null, 2));
}

function cleanup() {
  try { rmSync(TMP, { recursive: true }); } catch {}
}

test('listProjects returns error when no config exists', () => {
  mkdirSync(TMP, { recursive: true });
  const result = listProjects(TMP);
  assert.ok(result.error);
  cleanup();
});

test('listProjects returns projects from v2 config', () => {
  writeTmpConfig(makeV2Config());
  const result = listProjects(TMP);
  assert.equal(result.total, 2);
  assert.equal(result.activeProject, 'test-project');
  const tp = result.projects.find(p => p.name === 'test-project');
  assert.equal(tp.repoCount, 2);
  cleanup();
});

test('manageFocus sets active project', () => {
  writeTmpConfig(makeV2Config());
  const result = manageFocus(TMP, 'other-project');
  assert.equal(result.activeProject, 'other-project');
  // Verify persisted
  const check = manageFocus(TMP);
  assert.equal(check.activeProject, 'other-project');
  cleanup();
});

test('manageFocus rejects unknown project', () => {
  writeTmpConfig(makeV2Config());
  const result = manageFocus(TMP, 'nope');
  assert.ok(result.error);
  assert.ok(result.available.includes('test-project'));
  cleanup();
});

test('routeToProject matches by repo name', () => {
  writeTmpConfig(makeV2Config());
  const result = routeToProject(TMP, 'org/app');
  assert.equal(result.project, 'test-project');
  assert.equal(result.matchType, 'repo');
  cleanup();
});

test('routeToProject matches by short repo name', () => {
  writeTmpConfig(makeV2Config());
  const result = routeToProject(TMP, 'app');
  assert.equal(result.project, 'test-project');
  assert.equal(result.matchType, 'repo');
  cleanup();
});

test('routeToProject matches by tag', () => {
  writeTmpConfig(makeV2Config());
  const result = routeToProject(TMP, 'content');
  assert.equal(result.project, 'test-project');
  assert.equal(result.matchType, 'tag');
  cleanup();
});

test('routeToProject matches by project name', () => {
  writeTmpConfig(makeV2Config());
  const result = routeToProject(TMP, 'other-project');
  assert.equal(result.project, 'other-project');
  assert.equal(result.matchType, 'project-name');
  cleanup();
});

test('addRepo adds to v2 config', () => {
  writeTmpConfig(makeV2Config());
  const result = addRepo(TMP, { project: 'test-project', owner: 'org', repo: 'new-thing', role: 'source' });
  assert.equal(result.added, 'org/new-thing');
  assert.equal(result.totalRepos, 3);
  cleanup();
});

test('addRepo rejects duplicate', () => {
  writeTmpConfig(makeV2Config());
  const result = addRepo(TMP, { project: 'test-project', owner: 'org', repo: 'app' });
  assert.ok(result.warning);
  cleanup();
});

test('parseRepoId splits correctly', () => {
  const { owner, repo } = parseRepoId('microsoft/azure-mcp-server');
  assert.equal(owner, 'microsoft');
  assert.equal(repo, 'azure-mcp-server');
});

test('listProjectNames returns unique names', () => {
  const config = makeV2Config();
  const names = listProjectNames(config);
  assert.deepEqual(names.sort(), ['other-project', 'test-project']);
});

test('getProjectRepos filters correctly', () => {
  const config = makeV2Config();
  const repos = getProjectRepos(config, 'test-project');
  assert.equal(repos.length, 2);
  assert.equal(repos[0].repo, 'org/app');
});
