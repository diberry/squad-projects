#!/usr/bin/env node

/**
 * squad-projects CLI — multi-project management for Squad.
 *
 * Usage: squad-projects <command> [options]
 *
 * Commands:
 *   setup       Copy extension to .github/extensions/ and init config
 *   doctor      Health check
 *   status      Cross-project status overview
 *   list        List all projects
 *
 * Options:
 *   --help      Show help
 *   --json      Output as JSON
 */

import { parseArgs } from 'node:util';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpSync, existsSync, mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB_DIR = resolve(__dirname, '..', 'extensions', 'squad-projects', 'lib');

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    help: { type: 'boolean', short: 'h' },
    json: { type: 'boolean' },
    source: { type: 'string' },
  },
  strict: false,
});

const command = positionals[0];

function usage() {
  console.error(`Usage: squad-projects <command> [options]

Commands:
  setup       Copy extension to .github/extensions/ and init config
  doctor      Health check
  status      Cross-project status overview
  list        List all projects

Options:
  --help, -h  Show help
  --json      Output as JSON
  --source    Path to repos.json (for setup)`);
}

if (values.help || !command) {
  usage();
  process.exit(values.help ? 0 : 1);
}

async function run() {
  const repoRoot = process.cwd();

  switch (command) {
    case 'setup': {
      // Copy extension files
      const extSrc = resolve(__dirname, '..', 'extensions', 'squad-projects');
      const extDest = join(repoRoot, '.github', 'extensions', 'squad-projects');

      if (!existsSync(extDest)) {
        mkdirSync(extDest, { recursive: true });
        cpSync(extSrc, extDest, { recursive: true });
        console.log(`✓ Extension copied to ${extDest}`);
      } else {
        console.log(`⏭ Extension already exists at ${extDest}`);
      }

      // Init projects config
      const { initProjects } = await import(join(LIB_DIR, 'init.mjs'));
      return initProjects(repoRoot, values.source);
    }
    case 'doctor': {
      const { runDoctor } = await import(join(LIB_DIR, 'doctor.mjs'));
      return runDoctor(repoRoot);
    }
    case 'status': {
      const { getStatus } = await import(join(LIB_DIR, 'status.mjs'));
      return getStatus(repoRoot);
    }
    case 'list': {
      const { listProjects } = await import(join(LIB_DIR, 'list.mjs'));
      return listProjects(repoRoot);
    }
    default:
      console.error(`Unknown command: ${command}`);
      usage();
      process.exit(1);
  }
}

try {
  const result = await run();
  if (result !== undefined) {
    console.log(values.json ? JSON.stringify(result, null, 2) : formatHuman(result));
  }
} catch (err) {
  if (values.json) {
    console.log(JSON.stringify({ error: err.message }, null, 2));
  } else {
    console.error(`❌ ${err.message}`);
  }
  process.exit(1);
}

function formatHuman(result) {
  if (typeof result === 'string') return result;
  if (!result) return '';

  if (result.checks) {
    const lines = [`\n━━━ Health Check ━━━\n`];
    for (const check of result.checks) {
      const icon = check.status === 'pass' ? '✓' : check.status === 'warn' ? '⚠' : '✗';
      lines.push(`  ${icon} ${check.check}: ${check.message}`);
    }
    lines.push(`\n${result.healthy ? '✅' : '❌'} ${result.summary}`);
    return lines.join('\n');
  }

  if (result.projects && Array.isArray(result.projects)) {
    const lines = [`\n━━━ Projects ━━━\n`];
    for (const p of result.projects) {
      lines.push(`  📁 ${p.name} — ${p.description || '(no description)'}`);
      for (const r of p.repos) {
        lines.push(`     └─ ${r.owner}/${r.repo} (${r.role || 'source'})`);
      }
    }
    lines.push(`\n  Active: ${result.activeProject || 'none'}`);
    return lines.join('\n');
  }

  return JSON.stringify(result, null, 2);
}
