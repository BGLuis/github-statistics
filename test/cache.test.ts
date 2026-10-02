import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { CACHE_VERSION, clearCache, readCache, writeCache } from '../src/cache/manager.js';
import type { CacheData, FilterOptions } from '../src/types/index.js';
import { makeRepo } from './helpers.js';

const filters: FilterOptions = { scope: 'all', includeForks: false, includeOrgs: false };
const FETCHED_AT = '2026-01-01T12:00:00.000Z';
const fetchedMs = new Date(FETCHED_AT).getTime();
const minutes = (n: number) => n * 60 * 1000;

const makeCache = (overrides: Partial<CacheData> = {}): CacheData => ({
  version: CACHE_VERSION,
  username: 'octo',
  fetchedAt: FETCHED_AT,
  repos: [makeRepo()],
  filters,
  fast: false,
  ...overrides,
});

let root: string;
let cacheDir: string;
const previousDir = process.env.GITHUB_STATS_CACHE_DIR;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'github-stats-cache-'));
  cacheDir = path.join(root, 'nested');
  process.env.GITHUB_STATS_CACHE_DIR = cacheDir;
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
  if (previousDir === undefined) delete process.env.GITHUB_STATS_CACHE_DIR;
  else process.env.GITHUB_STATS_CACHE_DIR = previousDir;
});

describe('readCache', () => {
  it('returns the stored data while it is fresh', () => {
    writeCache(makeCache());

    const hit = readCache('octo', filters, false, 60, fetchedMs + minutes(30));

    assert.equal(hit?.repos.length, 1);
  });

  it('misses once the TTL has elapsed', () => {
    writeCache(makeCache());

    assert.equal(readCache('octo', filters, false, 60, fetchedMs + minutes(61)), null);
  });

  it('treats a TTL of 0 as "never read the cache"', () => {
    writeCache(makeCache());

    assert.equal(readCache('octo', filters, false, 0, fetchedMs), null);
  });

  it('misses when any filter differs', () => {
    writeCache(makeCache());
    const now = fetchedMs + minutes(1);

    assert.equal(readCache('octo', { ...filters, scope: 'public' }, false, 60, now), null);
    assert.equal(readCache('octo', { ...filters, includeForks: true }, false, 60, now), null);
    assert.equal(readCache('octo', { ...filters, includeOrgs: true }, false, 60, now), null);
  });

  it('never serves a --fast cache to a full run (it has no line/activity stats)', () => {
    writeCache(makeCache({ fast: true }));

    assert.equal(readCache('octo', filters, false, 60, fetchedMs + minutes(1)), null);
  });

  it('misses when the cache schema version changed', () => {
    writeCache(makeCache({ version: CACHE_VERSION - 1 }));

    assert.equal(readCache('octo', filters, false, 60, fetchedMs + minutes(1)), null);
  });

  it('misses for another user and on a corrupted file', () => {
    writeCache(makeCache());
    assert.equal(readCache('someone', filters, false, 60, fetchedMs + minutes(1)), null);

    fs.writeFileSync(path.join(cacheDir, 'cache-octo.json'), '{not json');
    assert.equal(readCache('octo', filters, false, 60, fetchedMs + minutes(1)), null);
  });
});

describe('writeCache', () => {
  it('keeps private repository data readable only by the owner', () => {
    writeCache(makeCache());

    const file = path.join(cacheDir, 'cache-octo.json');
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
    assert.equal(fs.statSync(cacheDir).mode & 0o777, 0o700);
  });

  it('tightens a directory left open by an older version and drops its world-readable cache.json', () => {
    fs.mkdirSync(cacheDir, { recursive: true, mode: 0o755 });
    fs.chmodSync(cacheDir, 0o755);
    fs.writeFileSync(path.join(cacheDir, 'cache.json'), '{}', { mode: 0o644 });

    writeCache(makeCache());

    assert.equal(fs.statSync(cacheDir).mode & 0o777, 0o700);
    assert.equal(fs.existsSync(path.join(cacheDir, 'cache.json')), false);
  });

  it('keeps one file per user and leaves no temp files behind', () => {
    writeCache(makeCache({ username: 'octo' }));
    writeCache(makeCache({ username: 'Other-User' }));

    assert.deepEqual(fs.readdirSync(cacheDir).sort(), ['cache-octo.json', 'cache-other-user.json']);
  });
});

describe('clearCache', () => {
  it("removes only the given user's cache", () => {
    writeCache(makeCache({ username: 'octo' }));
    writeCache(makeCache({ username: 'other' }));

    clearCache('octo');

    assert.deepEqual(fs.readdirSync(cacheDir), ['cache-other.json']);
  });

  it('does not throw when there is nothing to clear', () => {
    assert.doesNotThrow(() => clearCache('ghost'));
  });
});
