import { Octokit } from '@octokit/rest';
import { getGraphQLClient } from './client.js';
import { REPO_STATS_QUERY, RepoStatsQueryResult } from './graphql.js';
import { RepoData } from '../types/index.js';

/**
 * Retry wrapper for GitHub stats endpoints.
 * These endpoints return HTTP 202 while GitHub computes the data server-side.
 * Retries with exponential backoff: 3s, 5s, 7s, 9s, 11s...
 */
async function fetchStatsWithRetry<T>(
  fn: () => Promise<{ status: number; data: T }>,
  maxRetries = 5,
  initialDelayMs = 3000
): Promise<T | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fn();
      if (response.status === 202) {
        const delay = initialDelayMs + attempt * 2000;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return response.data;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Worker pool: runs up to `limit` async tasks concurrently.
 * Each worker picks the next available item atomically — no chunking needed.
 */
async function withConcurrency<T>(
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

/** Enrich a single repo with detailed stats from GraphQL + REST */
async function enrichOne(
  repo: RepoData,
  octokit: Octokit,
  graphqlClient: ReturnType<typeof getGraphQLClient>,
  fast: boolean
): Promise<RepoData> {
  const [owner, name] = repo.fullName.split('/');

  try {
    // ── GraphQL: commits, issues, PRs, releases, contributors ──
    const result = await graphqlClient<RepoStatsQueryResult>(REPO_STATS_QUERY, { owner, name });
    const r = result.repository;
    if (r) {
      repo.totalCommits = r.defaultBranchRef?.target?.history?.totalCount ?? 0;
      repo.openIssues   = r.issues.totalCount;
      repo.closedIssues = r.closedIssues.totalCount;
      repo.openPRs      = r.pullRequests.totalCount;
      repo.mergedPRs    = r.mergedPRs.totalCount;
      repo.closedPRs    = r.closedPRs.totalCount;
      repo.releases     = r.releases.totalCount;
      repo.contributors = r.mentionableUsers.totalCount;
    }

    // ── REST: languages (bytes per language) ──
    try {
      const { data: langs } = await octokit.rest.repos.listLanguages({ owner, repo: name });
      repo.languages = langs as Record<string, number>;
    } catch {
      // ignore — empty or inaccessible repo
    }

    // ── REST: slow stats (commit activity + lines added/deleted) ──
    // Skipped with --fast. GitHub returns 202 while computing — we retry with backoff.
    if (!fast) {
      // 1. Weekly commit activity → monthly chart
      const activity = await fetchStatsWithRetry<unknown[]>(() =>
        octokit.rest.repos.getCommitActivityStats({ owner, repo: name }) as Promise<{
          status: number;
          data: unknown[];
        }>
      );
      if (Array.isArray(activity)) {
        repo.commitActivity = (activity as Array<{ week?: number; total?: number; days?: number[] }>).map((a) => ({
          week: a.week ?? 0,
          total: a.total ?? 0,
          days: a.days ?? [],
        }));
      }

      // 2. Contributor stats → total lines added/deleted across all commits
      const contribStats = await fetchStatsWithRetry<
        Array<{ weeks: Array<{ w: number; a: number; d: number; c: number }> }>
      >(() =>
        octokit.rest.repos.getContributorsStats({ owner, repo: name }) as Promise<{
          status: number;
          data: Array<{ weeks: Array<{ w: number; a: number; d: number; c: number }> }>;
        }>
      );
      if (Array.isArray(contribStats)) {
        for (const contributor of contribStats) {
          for (const week of contributor.weeks) {
            repo.linesAdded   += week.a ?? 0;
            repo.linesDeleted += week.d ?? 0;
          }
        }
      }
    }
  } catch {
    // Skip repos we can't access (deleted, renamed, no permission)
  }

  return repo;
}

export async function enrichRepos(
  repos: RepoData[],
  octokit: Octokit,
  token: string,
  fast: boolean,
  concurrency: number,
  onProgress?: (done: number, total: number, repoName: string) => void
): Promise<RepoData[]> {
  const graphqlClient = getGraphQLClient(token);
  const enriched: RepoData[] = new Array(repos.length);
  let done = 0;

  await withConcurrency(
    repos,
    async (repo, index) => {
      const result = await enrichOne(repo, octokit, graphqlClient, fast);
      enriched[index] = result;
      done++;
      onProgress?.(done, repos.length, repo.name);
    },
    concurrency
  );

  return enriched;
}
