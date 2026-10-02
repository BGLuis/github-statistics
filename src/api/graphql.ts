// Pages of 50 repos regularly hit GitHub's ~10s GraphQL timeout (502/504) because of the
// per-repo author-filtered history count, so keep pages small.
const PAGE_SIZE = 20;

const REPO_FIELDS = `
  databaseId
  name
  nameWithOwner
  description
  isPrivate
  isFork
  isArchived
  stargazerCount
  forkCount
  watchers { totalCount }
  diskUsage
  primaryLanguage { name }
  languages(first: 30, orderBy: { field: SIZE, direction: DESC }) {
    edges { size node { name } }
  }
  repositoryTopics(first: 20) { nodes { topic { name } } }
  createdAt
  updatedAt
  pushedAt
  url
  issues(states: OPEN) { totalCount }
  closedIssues: issues(states: CLOSED) { totalCount }
  pullRequests(states: OPEN) { totalCount }
  mergedPRs: pullRequests(states: MERGED) { totalCount }
  closedPRs: pullRequests(states: CLOSED) { totalCount }
  releases { totalCount }
  defaultBranchRef {
    target {
      ... on Commit {
        history(author: { id: $authorId }) { totalCount }
      }
    }
  }
`;

export const USER_QUERY = `
  query User($login: String!) {
    user(login: $login) { login id }
  }
`;

export const VIEWER_QUERY = `
  query Viewer {
    viewer { login id }
  }
`;

export const REPOS_QUERY = `
  query Repos(
    $login: String!
    $authorId: ID!
    $cursor: String
    $privacy: RepositoryPrivacy
    $isFork: Boolean
    $affiliations: [RepositoryAffiliation]
  ) {
    user(login: $login) {
      repositories(
        first: ${PAGE_SIZE}
        after: $cursor
        privacy: $privacy
        isFork: $isFork
        ownerAffiliations: $affiliations
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        pageInfo { hasNextPage endCursor }
        nodes { ${REPO_FIELDS} }
      }
    }
  }
`;

export interface UserQueryResult {
  user: { login: string; id: string } | null;
}

export interface ViewerQueryResult {
  viewer: { login: string; id: string };
}

export interface RepoNode {
  databaseId: number | null;
  name: string;
  nameWithOwner: string;
  description: string | null;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  stargazerCount: number;
  forkCount: number;
  watchers: { totalCount: number };
  diskUsage: number | null;
  primaryLanguage: { name: string } | null;
  languages: { edges: Array<{ size: number; node: { name: string } } | null> | null } | null;
  repositoryTopics: { nodes: Array<{ topic: { name: string } } | null> | null } | null;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  url: string;
  issues: { totalCount: number };
  closedIssues: { totalCount: number };
  pullRequests: { totalCount: number };
  mergedPRs: { totalCount: number };
  closedPRs: { totalCount: number };
  releases: { totalCount: number };
  defaultBranchRef: {
    target: { history?: { totalCount: number } } | null;
  } | null;
}

export interface ReposQueryResult {
  user: {
    repositories: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: Array<RepoNode | null> | null;
    };
  } | null;
}
