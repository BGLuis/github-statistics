import { Octokit } from '@octokit/rest';
import { FilterOptions, GitHubUser, RepoData } from '../types/index.js';
import {
  REPOS_QUERY,
  RepoNode,
  ReposQueryResult,
  USER_QUERY,
  UserQueryResult,
  VIEWER_QUERY,
  ViewerQueryResult,
} from './graphql.js';

interface GraphqlErrorLike {
  data?: unknown;
  errors?: Array<{ type?: string }>;
}

// octokit.graphql throws GraphqlResponseError carrying the partial `data` and `errors`.
function asGraphqlError(e: unknown): GraphqlErrorLike | null {
  return typeof e === 'object' && e !== null && 'errors' in e ? (e as GraphqlErrorLike) : null;
}

export async function resolveUser(octokit: Octokit, login?: string): Promise<GitHubUser> {
  if (!login) {
    const { viewer } = await octokit.graphql<ViewerQueryResult>(VIEWER_QUERY);
    return { login: viewer.login, id: viewer.id };
  }

  try {
    const { user } = await octokit.graphql<UserQueryResult>(USER_QUERY, { login });
    if (user) return { login: user.login, id: user.id };
  } catch (e: unknown) {
    if (asGraphqlError(e)?.errors?.[0]?.type !== 'NOT_FOUND') throw e;
  }
  throw new Error(`GitHub user "${login}" not found.`);
}

export function buildRepoVariables(user: GitHubUser, filters: FilterOptions) {
  return {
    login: user.login,
    authorId: user.id,
    privacy: filters.scope === 'all' ? null : filters.scope.toUpperCase(),
    isFork: filters.includeForks ? null : false,
    affiliations: filters.includeOrgs
      ? ['OWNER', 'COLLABORATOR', 'ORGANIZATION_MEMBER']
      : ['OWNER', 'COLLABORATOR'],
  };
}

export async function fetchRepos(
  octokit: Octokit,
  user: GitHubUser,
  filters: FilterOptions,
  onProgress?: (count: number) => void
): Promise<RepoData[]> {
  const repos: RepoData[] = [];
  const variables = buildRepoVariables(user, filters);
  let cursor: string | null = null;

  while (true) {
    const page: ReposQueryResult = await queryReposPage(octokit, { ...variables, cursor });
    const connection = page.user?.repositories;
    if (!connection) break;

    for (const node of connection.nodes ?? []) {
      if (node) repos.push(toRepoData(node));
    }
    onProgress?.(repos.length);

    if (!connection.pageInfo.hasNextPage) break;
    cursor = connection.pageInfo.endCursor;
  }

  return repos;
}

async function queryReposPage(
  octokit: Octokit,
  variables: Record<string, unknown>
): Promise<ReposQueryResult> {
  try {
    return await octokit.graphql<ReposQueryResult>(REPOS_QUERY, variables);
  } catch (e: unknown) {
    // Partial errors (e.g. one repo blocked by SAML) still return usable nodes.
    const partial = asGraphqlError(e)?.data as ReposQueryResult | undefined;
    if (partial?.user?.repositories?.nodes?.some(Boolean)) return partial;
    throw e;
  }
}

export function toRepoData(node: RepoNode): RepoData {
  const languages: Record<string, number> = {};
  for (const edge of node.languages?.edges ?? []) {
    if (edge) languages[edge.node.name] = edge.size;
  }

  const topics = (node.repositoryTopics?.nodes ?? []).flatMap((n) => (n ? [n.topic.name] : []));

  return {
    id: node.databaseId ?? 0,
    name: node.name,
    fullName: node.nameWithOwner,
    description: node.description,
    isPrivate: node.isPrivate,
    isFork: node.isFork,
    isArchived: node.isArchived,
    stars: node.stargazerCount,
    forks: node.forkCount,
    watchers: node.watchers.totalCount,
    size: node.diskUsage ?? 0,
    language: node.primaryLanguage?.name ?? null,
    topics,
    languages,
    openIssues: node.issues.totalCount,
    closedIssues: node.closedIssues.totalCount,
    openPRs: node.pullRequests.totalCount,
    mergedPRs: node.mergedPRs.totalCount,
    closedPRs: node.closedPRs.totalCount,
    totalCommits: node.defaultBranchRef?.target?.history?.totalCount ?? 0,
    linesAdded: 0,
    linesDeleted: 0,
    releases: node.releases.totalCount,
    commitActivity: [],
    statsStatus: 'skipped',
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    pushedAt: node.pushedAt ?? '',
    htmlUrl: node.url,
  };
}
