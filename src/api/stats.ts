import { Octokit } from '@octokit/rest';
import { RepoData, WeeklyActivity } from '../types/index.js';

export type StatsResult<T> = { state: 'ok'; data: T | null } | { state: 'unavailable' };

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

export interface ContributorStats {
  author: { login: string } | null;
  weeks: Array<{ w: number; a: number; d: number; c: number }>;
}

export interface UserContribution {
  linesAdded: number;
  linesDeleted: number;
  commitActivity: WeeklyActivity[];
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * GitHub stats endpoints answer HTTP 202 while computing the data server-side,
 * so we poll with a growing delay: 3s, 5s, 7s, 9s, 11s...
 */
export async function fetchStatsWithRetry<T>(
  fn: () => Promise<{ status: number; data: T }>,
  { maxRetries = 5, initialDelayMs = 3000, sleep = defaultSleep }: RetryOptions = {}
): Promise<StatsResult<T>> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fn();
      if (response.status === 202) {
        await sleep(initialDelayMs + attempt * 2000);
        continue;
      }
      return { state: 'ok', data: response.data ?? null };
    } catch (e: unknown) {
      // 409 = empty repository: nothing to compute, which is a valid result.
      if ((e as { status?: number }).status === 409) return { state: 'ok', data: null };
      return { state: 'unavailable' };
    }
  }
  return { state: 'unavailable' };
}

/**
 * Worker pool: runs up to `limit` async tasks concurrently.
 * Each worker picks the next available item atomically — no chunking needed.
 */
export async function withConcurrency<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<void>,
  limit: number
): Promise<void> {
  let cursor = 0;

  async function worker(): Promise<void> {
    while (true) {
      const i = cursor++;
      if (i >= items.length) break;
      await fn(items[i], i);
    }
  }

  const poolSize = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: poolSize }, () => worker()));
}

export function extractUserContribution(
  contributors: ContributorStats[],
  username: string
): UserContribution {
  const login = username.toLowerCase();
  const result: UserContribution = { linesAdded: 0, linesDeleted: 0, commitActivity: [] };

  for (const contributor of contributors) {
    if (contributor.author?.login.toLowerCase() !== login) continue;
    for (const week of contributor.weeks) {
      result.linesAdded += week.a ?? 0;
      result.linesDeleted += week.d ?? 0;
      if (week.c > 0) result.commitActivity.push({ week: week.w, total: week.c });
    }
  }

  return result;
}

async function enrichOne(repo: RepoData, octokit: Octokit, username: string): Promise<RepoData> {
  const [owner, name] = repo.fullName.split('/');

  const result = await fetchStatsWithRetry<ContributorStats[]>(
    () =>
      octokit.rest.repos.getContributorsStats({ owner, repo: name }) as Promise<{
        status: number;
        data: ContributorStats[];
      }>
  );

  if (result.state === 'unavailable') return { ...repo, statsStatus: 'unavailable' };

  const contribution = Array.isArray(result.data)
    ? extractUserContribution(result.data, username)
    : { linesAdded: 0, linesDeleted: 0, commitActivity: [] };

  return { ...repo, ...contribution, statsStatus: 'ok' };
}

export async function enrichRepos(
  repos: RepoData[],
  octokit: Octokit,
  username: string,
  fast: boolean,
  concurrency: number,
  onProgress?: (done: number, total: number, repoName: string) => void
): Promise<RepoData[]> {
  if (fast) return repos.map((repo) => ({ ...repo, statsStatus: 'skipped' }));

  const enriched: RepoData[] = new Array(repos.length);
  let done = 0;

  await withConcurrency(
    repos,
    async (repo, index) => {
      enriched[index] = await enrichOne(repo, octokit, username);
      done++;
      onProgress?.(done, repos.length, repo.name);
    },
    concurrency
  );

  return enriched;
}
