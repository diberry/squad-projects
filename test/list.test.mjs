import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listProjects } from '../extensions/squad-projects/lib/list.mjs';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const TMP = join(tmpdir(), 'squad-projects-test-' + Date.now());

test('listProjects returns error when no config exists', () => {
  mkdirSync(TMP, { recursive: true });
  const result = listProjects(TMP);
  assert.ok(result.error);
  rmSync(TMP, { recursive: true });
});

test('listProjects returns projects from config', () => {
  mkdirSync(join(TMP, '.squad'), { recursive: true });
  writeFileSync(join(TMP, '.squad', 'projects.json'), JSON.stringify({
    version: '1.0.0',
    projects: {
      'test-project': {
        description: 'Test',
        repos: [{ owner: 'org', repo: 'app', role: 'source' }],
        labels: ['test'],
        focus: null,
      },
    },
    activeProject: null,
  }));

  const result = listProjects(TMP);
  assert.equal(result.total, 1);
  assert.equal(result.projects[0].name, 'test-project');
  rmSync(TMP, { recursive: true });
});
