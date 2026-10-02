import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CacheData, FilterOptions } from '../types/index.js';

export const CACHE_VERSION = 2;

function cacheDir(): string {
  return process.env.GITHUB_STATS_CACHE_DIR ?? path.join(os.homedir(), '.github-stats');
}

function cacheFile(username: string): string {
  const safeName = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return path.join(cacheDir(), `cache-${safeName}.json`);
}

export function readCache(
  username: string,
  filters: FilterOptions,
  fast: boolean,
  ttlMinutes: number,
  now: number = Date.now()
): CacheData | null {
  if (ttlMinutes <= 0) return null;

  try {
    const cache: CacheData = JSON.parse(fs.readFileSync(cacheFile(username), 'utf-8'));

    if (cache.version !== CACHE_VERSION) return null;
    if (cache.username !== username) return null;
    if (cache.fast !== fast) return null;
    if (
      cache.filters.scope !== filters.scope ||
      cache.filters.includeForks !== filters.includeForks ||
      cache.filters.includeOrgs !== filters.includeOrgs
    ) {
      return null;
    }

    const ageMinutes = (now - new Date(cache.fetchedAt).getTime()) / 1000 / 60;
    if (ageMinutes > ttlMinutes) return null;

    return cache;
  } catch {
    return null;
  }
}

export function writeCache(data: CacheData): void {
  const file = cacheFile(data.username);
  const tmp = `${file}.${process.pid}.tmp`;
  try {
    fs.mkdirSync(cacheDir(), { recursive: true, mode: 0o700 });
    // mkdir's mode only applies on creation; tighten a directory left by an older version.
    fs.chmodSync(cacheDir(), 0o700);
    fs.writeFileSync(tmp, JSON.stringify(data), { mode: 0o600 });
    fs.renameSync(tmp, file);
    // Pre-v2 single-file cache: world-readable and holds private repo data.
    fs.rmSync(path.join(cacheDir(), 'cache.json'), { force: true });
  } catch {
    fs.rmSync(tmp, { force: true });
  }
}

export function clearCache(username: string): void {
  try {
    fs.rmSync(cacheFile(username), { force: true });
  } catch {
    // ignore cache clear errors
  }
}
