import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildRepoVariables, toRepoData } from '../src/api/repos.js';
import type { RepoNode } from '../src/api/graphql.js';
import type { FilterOptions } from '../src/types/index.js';

const user = { login: 'octo', id: 'U_1' };
const filters = (overrides: Partial<FilterOptions> = {}): FilterOptions => ({
  scope: 'all',
  includeForks: false,
  includeOrgs: false,
  ...overrides,
});

function makeNode(overrides: Partial<RepoNode> = {}): RepoNode {
  return {
    databaseId: 42,
    name: 'repo',
    nameWithOwner: 'octo/repo',
    description: 'desc',
    isPrivate: true,
    isFork: false,
    isArchived: false,
    stargazerCount: 25,
    forkCount: 3,
    watchers: { totalCount: 7 },
    diskUsage: 120,
    primaryLanguage: { name: 'TypeScript' },
    languages: {
      edges: [
        { size: 900, node: { name: 'TypeScript' } },
        { size: 100, node: { name: 'CSS' } },
      ],
    },
    repositoryTopics: { nodes: [{ topic: { name: 'cli' } }, { topic: { name: 'github' } }] },
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
    pushedAt: '2022-01-01T00:00:00Z',
    url: 'https://github.com/octo/repo',
    issues: { totalCount: 2 },
    closedIssues: { totalCount: 5 },
    pullRequests: { totalCount: 1 },
    mergedPRs: { totalCount: 8 },
    closedPRs: { totalCount: 4 },
    releases: { totalCount: 6 },
    defaultBranchRef: { target: { history: { totalCount: 321 } } },
    ...overrides,
  } as RepoNode;
}

describe('toRepoData', () => {
  it('takes watchers from the watchers connection, not from the star count', () => {
    const repo = toRepoData(makeNode());

    assert.equal(repo.stars, 25);
    assert.equal(repo.watchers, 7);
  });

  it('maps languages, topics and counters', () => {
    const repo = toRepoData(makeNode());

    assert.deepEqual(repo.languages, { TypeScript: 900, CSS: 100 });
    assert.deepEqual(repo.topics, ['cli', 'github']);
    assert.equal(repo.language, 'TypeScript');
    assert.equal(repo.fullName, 'octo/repo');
    assert.equal(repo.totalCommits, 321);
    assert.equal(repo.mergedPRs, 8);
    assert.equal(repo.closedPRs, 4);
    assert.equal(repo.releases, 6);
    assert.equal(repo.statsStatus, 'skipped');
  });

  it('falls back to safe defaults for null fields', () => {
    const repo = toRepoData(
      makeNode({
        databaseId: null,
        diskUsage: null,
        primaryLanguage: null,
        pushedAt: null,
        languages: null,
        repositoryTopics: null,
        defaultBranchRef: null,
      } as unknown as Partial<RepoNode>)
    );

    assert.equal(repo.id, 0);
    assert.equal(repo.size, 0);
    assert.equal(repo.language, null);
    assert.equal(repo.pushedAt, '');
    assert.deepEqual(repo.languages, {});
    assert.deepEqual(repo.topics, []);
    assert.equal(repo.totalCommits, 0);
  });
});

describe('buildRepoVariables', () => {
  it('filters commits and repos by the analysed user', () => {
    const vars = buildRepoVariables(user, filters());

    assert.equal(vars.login, 'octo');
    assert.equal(vars.authorId, 'U_1');
  });

  it('only adds organization repos when --include-orgs is set', () => {
    assert.deepEqual(buildRepoVariables(user, filters()).affiliations, ['OWNER', 'COLLABORATOR']);
    assert.ok(buildRepoVariables(user, filters({ includeOrgs: true })).affiliations.includes('ORGANIZATION_MEMBER'));
  });

  it('maps scope to the GraphQL privacy filter', () => {
    assert.equal(buildRepoVariables(user, filters({ scope: 'all' })).privacy, null);
    assert.equal(buildRepoVariables(user, filters({ scope: 'public' })).privacy, 'PUBLIC');
    assert.equal(buildRepoVariables(user, filters({ scope: 'private' })).privacy, 'PRIVATE');
  });

  it('excludes forks unless --include-forks is set', () => {
    assert.equal(buildRepoVariables(user, filters()).isFork, false);
    assert.equal(buildRepoVariables(user, filters({ includeForks: true })).isFork, null);
  });
});
