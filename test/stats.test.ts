import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Octokit } from '@octokit/rest';
import {
  ContributorStats,
  enrichRepos,
  extractUserContribution,
  fetchStatsWithRetry,
  withConcurrency,
} from '../src/api/stats.js';
import { makeRepo } from './helpers.js';

const httpError = (status: number) => Object.assign(new Error(`HTTP ${status}`), { status });

describe('fetchStatsWithRetry', () => {
  it('retries while GitHub answers 202 and backs off with growing delays', async () => {
    const delays: number[] = [];
    let calls = 0;
    const result = await fetchStatsWithRetry(
      async () => {
        calls++;
        return calls < 3 ? { status: 202, data: {} } : { status: 200, data: ['done'] };
      },
      { initialDelayMs: 1000, sleep: async (ms) => void delays.push(ms) }
    );

    assert.deepEqual(result, { state: 'ok', data: ['done'] });
    assert.deepEqual(delays, [1000, 3000]);
  });

  it('reports unavailable when 202 never turns into data', async () => {
    let calls = 0;
    const result = await fetchStatsWithRetry(
      async () => {
        calls++;
        return { status: 202, data: {} };
      },
      { maxRetries: 3, sleep: async () => {} }
    );

    assert.deepEqual(result, { state: 'unavailable' });
    assert.equal(calls, 3);
  });

  it('treats 409 (empty repository) as a valid empty result', async () => {
    const result = await fetchStatsWithRetry(
      async () => {
        throw httpError(409);
      },
      { sleep: async () => {} }
    );

    assert.deepEqual(result, { state: 'ok', data: null });
  });

  it('does not mask real failures as success', async () => {
    for (const status of [403, 500]) {
      const result = await fetchStatsWithRetry(
        async () => {
          throw httpError(status);
        },
        { sleep: async () => {} }
      );
      assert.deepEqual(result, { state: 'unavailable' }, `status ${status}`);
    }
  });
});

describe('withConcurrency', () => {
  it('processes every item without exceeding the limit', async () => {
    let running = 0;
    let peak = 0;
    const seen: number[] = [];

    await withConcurrency(
      Array.from({ length: 12 }, (_, i) => i),
      async (item) => {
        running++;
        peak = Math.max(peak, running);
        await new Promise((r) => setTimeout(r, 2));
        seen.push(item);
        running--;
      },
      3
    );

    assert.equal(peak, 3);
    assert.deepEqual(seen.sort((a, b) => a - b), Array.from({ length: 12 }, (_, i) => i));
  });

  it('handles fewer items than the limit', async () => {
    const seen: string[] = [];
    await withConcurrency(['a', 'b'], async (item) => void seen.push(item), 10);
    assert.deepEqual(seen.sort(), ['a', 'b']);
  });
});

describe('extractUserContribution', () => {
  const contributors: ContributorStats[] = [
    {
      author: { login: 'Octo' },
      weeks: [
        { w: 100, a: 10, d: 2, c: 3 },
        { w: 200, a: 5, d: 1, c: 0 },
        { w: 300, a: 0, d: 0, c: 4 },
      ],
    },
    { author: { login: 'someone-else' }, weeks: [{ w: 100, a: 999, d: 999, c: 50 }] },
    { author: null, weeks: [{ w: 100, a: 777, d: 777, c: 70 }] },
  ];

  it('only counts the analysed user, matching the login case-insensitively', () => {
    const result = extractUserContribution(contributors, 'octo');

    assert.equal(result.linesAdded, 15);
    assert.equal(result.linesDeleted, 3);
  });

  it('keeps only weeks with commits in the activity series', () => {
    const result = extractUserContribution(contributors, 'OCTO');

    assert.deepEqual(result.commitActivity, [
      { week: 100, total: 3 },
      { week: 300, total: 4 },
    ]);
  });

  it('returns zeros when the user is not among the contributors', () => {
    assert.deepEqual(extractUserContribution(contributors, 'nobody'), {
      linesAdded: 0,
      linesDeleted: 0,
      commitActivity: [],
    });
  });
});

describe('enrichRepos', () => {
  function fakeOctokit(handler: () => Promise<unknown>) {
    const calls = { count: 0 };
    const octokit = {
      rest: {
        repos: {
          getContributorsStats: async () => {
            calls.count++;
            return handler();
          },
        },
      },
    } as unknown as Octokit;
    return { octokit, calls };
  }

  it('makes no REST calls in fast mode and marks stats as skipped', async () => {
    const { octokit, calls } = fakeOctokit(async () => ({ status: 200, data: [] }));
    const repos = [makeRepo({ fullName: 'octo/a' }), makeRepo({ id: 2, fullName: 'octo/b' })];

    const result = await enrichRepos(repos, octokit, 'octo', true, 2);

    assert.equal(calls.count, 0);
    assert.deepEqual(result.map((r) => r.statsStatus), ['skipped', 'skipped']);
  });

  it("fills in only the user's lines and commits, keeping input order", async () => {
    const { octokit } = fakeOctokit(async () => ({
      status: 200,
      data: [
        { author: { login: 'octo' }, weeks: [{ w: 100, a: 7, d: 3, c: 2 }] },
        { author: { login: 'other' }, weeks: [{ w: 100, a: 500, d: 500, c: 9 }] },
      ],
    }));
    const repos = [makeRepo({ name: 'a', fullName: 'octo/a' }), makeRepo({ id: 2, name: 'b', fullName: 'octo/b' })];

    const result = await enrichRepos(repos, octokit, 'octo', false, 2);

    assert.deepEqual(result.map((r) => r.name), ['a', 'b']);
    for (const repo of result) {
      assert.equal(repo.statsStatus, 'ok');
      assert.equal(repo.linesAdded, 7);
      assert.equal(repo.linesDeleted, 3);
      assert.deepEqual(repo.commitActivity, [{ week: 100, total: 2 }]);
    }
  });

  it("marks a repo as 'unavailable' when the stats request fails", async () => {
    const { octokit } = fakeOctokit(async () => {
      throw httpError(500);
    });

    const [repo] = await enrichRepos([makeRepo()], octokit, 'octo', false, 1);

    assert.equal(repo.statsStatus, 'unavailable');
    assert.equal(repo.linesAdded, 0);
  });

  it('reports progress once per repository', async () => {
    const { octokit } = fakeOctokit(async () => ({ status: 200, data: [] }));
    const progress: number[] = [];

    await enrichRepos(
      [makeRepo(), makeRepo({ id: 2 }), makeRepo({ id: 3 })],
      octokit,
      'octo',
      false,
      2,
      (done) => progress.push(done)
    );

    assert.deepEqual(progress, [1, 2, 3]);
  });
});
