import { Octokit } from '@octokit/rest';
import { FilterOptions, RepoData } from '../types/index.js';

export async function fetchRepos(
  octokit: Octokit,
  username: string,
  options: FilterOptions,
  onProgress?: (count: number) => void
): Promise<RepoData[]> {
  const repos: RepoData[] = [];

  // Fetch user repos
  const userReposIter = octokit.paginate.iterator(octokit.rest.repos.listForAuthenticatedUser, {
    type: options.scope === 'public' ? 'public' : options.scope === 'private' ? 'private' : 'all',
    per_page: 100,
    sort: 'updated',
  });

  for await (const { data } of userReposIter) {
    for (const repo of data) {
      if (!options.includeForks && repo.fork) continue;
      repos.push(transformRepo(repo));
      onProgress?.(repos.length);
    }
  }

  // Fetch org repos if requested
  if (options.includeOrgs) {
    const orgsIter = octokit.paginate.iterator(octokit.rest.orgs.listForAuthenticatedUser, {
      per_page: 100,
    });

    for await (const { data: orgs } of orgsIter) {
      for (const org of orgs) {
        const orgReposIter = octokit.paginate.iterator(octokit.rest.repos.listForOrg, {
          org: org.login,
          type: 'all',
          per_page: 100,
        });

        for await (const { data } of orgReposIter) {
          for (const repo of data) {
            if (!options.includeForks && repo.fork) continue;
            // Avoid duplicates
            if (!repos.find((r) => r.id === repo.id)) {
              repos.push(transformRepo(repo));
              onProgress?.(repos.length);
            }
          }
        }
      }
    }
  }

  return repos;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformRepo(repo: any): RepoData {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    isPrivate: repo.private,
    isFork: repo.fork,
    isArchived: repo.archived,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    watchers: repo.watchers_count ?? 0,
    size: repo.size ?? 0,
    language: repo.language,
    topics: repo.topics ?? [],
    languages: {},
    openIssues: repo.open_issues_count ?? 0,
    closedIssues: 0,
    openPRs: 0,
    mergedPRs: 0,
    closedPRs: 0,
    totalCommits: 0,
    linesAdded: 0,
    linesDeleted: 0,
    releases: 0,
    contributors: 0,
    commitActivity: [],
    createdAt: repo.created_at ?? '',
    updatedAt: repo.updated_at ?? '',
    pushedAt: repo.pushed_at ?? '',
    htmlUrl: repo.html_url ?? '',
  };
}
