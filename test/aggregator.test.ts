import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { aggregateStats } from '../src/aggregator/index.js';
import { makeRepo } from './helpers.js';

// Mid-month timestamps keep the month bucket stable in any timezone.
const unix = (iso: string) => Math.floor(new Date(iso).getTime() / 1000);

describe('aggregateStats', () => {
  it('sums per-repository counters', () => {
    const stats = aggregateStats([
      makeRepo({ id: 1, stars: 10, forks: 1, watchers: 4, totalCommits: 100, linesAdded: 50, linesDeleted: 20, openIssues: 2, closedIssues: 3, openPRs: 1, mergedPRs: 5, closedPRs: 2, releases: 4, size: 100 }),
      makeRepo({ id: 2, stars: 5, forks: 2, watchers: 1, totalCommits: 50, linesAdded: 10, linesDeleted: 5, openIssues: 1, closedIssues: 1, openPRs: 0, mergedPRs: 1, closedPRs: 0, releases: 1, size: 300 }),
    ]);

    assert.equal(stats.totalRepos, 2);
    assert.equal(stats.totalStars, 15);
    assert.equal(stats.totalForks, 3);
    assert.equal(stats.totalWatchers, 5);
    assert.equal(stats.totalCommits, 150);
    assert.equal(stats.totalLinesAdded, 60);
    assert.equal(stats.totalLinesDeleted, 25);
    assert.equal(stats.totalIssuesOpen, 3);
    assert.equal(stats.totalIssuesClosed, 4);
    assert.equal(stats.totalPRsOpen, 1);
    assert.equal(stats.totalPRsMerged, 6);
    assert.equal(stats.totalPRsClosed, 2);
    assert.equal(stats.totalReleases, 5);
    assert.equal(stats.totalSizeKB, 400);
    assert.equal(stats.avgRepoSize, 200);
  });

  it('handles an empty profile without dividing by zero', () => {
    const stats = aggregateStats([]);

    assert.equal(stats.totalRepos, 0);
    assert.equal(stats.avgRepoSize, 0);
    assert.deepEqual(stats.topRepos, []);
  });

  it('ranks the top 10 repositories by stars', () => {
    const repos = Array.from({ length: 12 }, (_, i) => makeRepo({ id: i, name: `r${i}`, stars: i }));

    const { topRepos } = aggregateStats(repos);

    assert.equal(topRepos.length, 10);
    assert.deepEqual(topRepos.map((r) => r.stars), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  });

  it('counts repositories whose line/activity stats were unavailable', () => {
    const stats = aggregateStats([
      makeRepo({ id: 1, statsStatus: 'unavailable' }),
      makeRepo({ id: 2, statsStatus: 'ok' }),
      makeRepo({ id: 3, statsStatus: 'skipped' }),
      makeRepo({ id: 4, statsStatus: 'unavailable' }),
    ]);

    assert.equal(stats.reposStatsUnavailable, 2);
  });

  it('merges languages and topics across repositories', () => {
    const stats = aggregateStats([
      makeRepo({ id: 1, languages: { TypeScript: 800, CSS: 200 }, topics: ['cli', 'github'] }),
      makeRepo({ id: 2, languages: { TypeScript: 200 }, topics: ['cli'] }),
    ]);

    assert.deepEqual(stats.languages, { TypeScript: 1000, CSS: 200 });
    assert.equal(stats.totalBytes, 1200);
    assert.equal(stats.totalLinesEstimate, 30);
    assert.deepEqual(stats.topics, { cli: 2, github: 1 });
  });

  it('buckets a week by its UTC month, regardless of the local timezone', () => {
    const stats = aggregateStats([
      makeRepo({ commitActivity: [{ week: unix('2024-04-01T00:00:00Z'), total: 4 }] }),
    ]);

    assert.deepEqual(stats.monthlyCommits, { '2024-04': 4 });
  });

  it('buckets weekly commits into months across repositories', () => {
    const stats = aggregateStats([
      makeRepo({
        id: 1,
        commitActivity: [
          { week: unix('2024-03-10T12:00:00Z'), total: 3 },
          { week: unix('2024-03-17T12:00:00Z'), total: 2 },
          { week: unix('2024-04-14T12:00:00Z'), total: 7 },
        ],
      }),
      makeRepo({ id: 2, commitActivity: [{ week: unix('2024-03-24T12:00:00Z'), total: 1 }] }),
    ]);

    assert.deepEqual(stats.monthlyCommits, { '2024-03': 6, '2024-04': 7 });
  });
});
