/**
 * squad-projects — Copilot CLI extension entry point.
 *
 * Registers all squad_projects_* tools for multi-project/multi-repo management.
 */

import { joinSession } from '@github/copilot-sdk/extension';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB_DIR = join(__dirname, 'lib');

function resolveRepoRoot() {
  return join(__dirname, '..', '..', '..');
}

function jsonHandler(fn) {
  return async (params = {}) => {
    try {
      const result = await fn(params);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }, null, 2);
    }
  };
}

const REPO_ROOT = resolveRepoRoot();
const lib = (name) => import(join(LIB_DIR, name));

const session = await joinSession({
  tools: [
    {
      name: 'squad_projects_list',
      description: 'List all projects with their repos, status, and current focus.',
      skipPermission: true,
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      handler: jsonHandler(async () => {
        const { listProjects } = await lib('list.mjs');
        return listProjects(REPO_ROOT);
      }),
    },
    {
      name: 'squad_projects_route',
      description: 'Given a repo name, issue number, or topic — determine which project owns it.',
      skipPermission: true,
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Repo name, issue reference, or topic to route' },
        },
        required: ['query'],
      },
      handler: jsonHandler(async ({ query }) => {
        const { routeToProject } = await lib('route.mjs');
        return routeToProject(REPO_ROOT, query);
      }),
    },
    {
      name: 'squad_projects_focus',
      description: 'Get or set the active project for this session.',
      skipPermission: true,
      parameters: {
        type: 'object',
        properties: {
          project: { type: 'string', description: 'Project name to set as active (omit to get current)' },
        },
        required: [],
      },
      handler: jsonHandler(async ({ project }) => {
        const { manageFocus } = await lib('focus.mjs');
        return manageFocus(REPO_ROOT, project);
      }),
    },
    {
      name: 'squad_projects_ralph_dispatch',
      description: 'Scan issues across all repos in a project, return unified prioritized board.',
      skipPermission: true,
      parameters: {
        type: 'object',
        properties: {
          project: { type: 'string', description: 'Project name to scan' },
          labels: { type: 'string', description: 'Optional comma-separated label filter' },
        },
        required: ['project'],
      },
      handler: jsonHandler(async ({ project, labels }) => {
        const { ralphDispatch } = await lib('ralph-dispatch.mjs');
        return ralphDispatch(REPO_ROOT, project, labels);
      }),
    },
    {
      name: 'squad_projects_status',
      description: 'Cross-project status: open PRs, blocked issues, recent activity per project.',
      skipPermission: true,
      parameters: {
        type: 'object',
        properties: {
          project: { type: 'string', description: 'Optional project name (omit for all projects)' },
        },
        required: [],
      },
      handler: jsonHandler(async ({ project }) => {
        const { getStatus } = await lib('status.mjs');
        return getStatus(REPO_ROOT, project);
      }),
    },
    {
      name: 'squad_projects_init',
      description: 'One-time setup: create .squad/projects.json from existing repos.json or manual input.',
      skipPermission: true,
      parameters: {
        type: 'object',
        properties: {
          source: { type: 'string', description: 'Path to repos.json or "manual" for interactive setup' },
        },
        required: [],
      },
      handler: jsonHandler(async ({ source }) => {
        const { initProjects } = await lib('init.mjs');
        return initProjects(REPO_ROOT, source);
      }),
    },
    {
      name: 'squad_projects_doctor',
      description: 'Health check: validate project config, repo paths, git status.',
      skipPermission: true,
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      handler: jsonHandler(async () => {
        const { runDoctor } = await lib('doctor.mjs');
        return runDoctor(REPO_ROOT);
      }),
    },
    {
      name: 'squad_projects_add_repo',
      description: 'Register a new repo under a project.',
      skipPermission: true,
      parameters: {
        type: 'object',
        properties: {
          project: { type: 'string', description: 'Project name' },
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          role: { type: 'string', description: 'Repo role: source, content, docs, config' },
        },
        required: ['project', 'owner', 'repo'],
      },
      handler: jsonHandler(async ({ project, owner, repo, role }) => {
        const { addRepo } = await lib('add-repo.mjs');
        return addRepo(REPO_ROOT, { project, owner, repo, role: role || 'source' });
      }),
    },
  ],
});
