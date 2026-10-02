import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

function runCli(args: string[], env: NodeJS.ProcessEnv = {}) {
  return spawnSync(process.execPath, ['--import', 'tsx', 'src/index.ts', ...args], {
    cwd: root,
    encoding: 'utf-8',
    env: { ...process.env, GITHUB_TOKEN: 'test-token', ...env },
    timeout: 30_000,
  });
}

describe('CLI', () => {
  it('prints the version declared in package.json', () => {
    const result = runCli(['--version']);

    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), version);
  });

  it('rejects an unknown --scope', () => {
    const result = runCli(['--scope', 'everything']);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /scope/i);
  });

  it('rejects invalid --concurrency and --cache-ttl values', () => {
    for (const args of [['--concurrency', '0'], ['--concurrency', 'abc'], ['--cache-ttl', '-1']]) {
      const result = runCli(args);
      assert.notEqual(result.status, 0, args.join(' '));
      assert.match(result.stderr, /integer/, args.join(' '));
    }
  });

  it('fails fast with a clear message when there is no interactive terminal', () => {
    const result = runCli(['--user', 'octo']);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /interactive terminal/);
  });
});
