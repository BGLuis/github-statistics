import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CacheData, FilterOptions } from '../types/index.js';

const CACHE_DIR = path.join(os.homedir(), '.github-stats');
const CACHE_FILE = path.join(CACHE_DIR, 'cache.json');

export function readCache(username: string, filters: FilterOptions, ttlMinutes: number): CacheData | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const cache: CacheData = JSON.parse(raw);

    if (cache.username !== username) return null;

    // Check filters match
    if (
      cache.filters.scope !== filters.scope ||
      cache.filters.includeForks !== filters.includeForks ||
      cache.filters.includeOrgs !== filters.includeOrgs
    ) {
      return null;
    }

    // Check TTL
    const fetchedAt = new Date(cache.fetchedAt).getTime();
    const now = Date.now();
    const diffMinutes = (now - fetchedAt) / 1000 / 60;
    if (diffMinutes > ttlMinutes) return null;

    return cache;
  } catch {
    return null;
  }
}

export function writeCache(data: CacheData): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch {
    // ignore cache write errors
  }
}

export function clearCache(): void {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  } catch {
    // ignore cache clear errors
  }
}
