export const REPO_STATS_QUERY = `
  query RepoStats($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history {
              totalCount
            }
          }
        }
      }
      issues(states: OPEN) { totalCount }
      closedIssues: issues(states: CLOSED) { totalCount }
      pullRequests(states: OPEN) { totalCount }
      mergedPRs: pullRequests(states: MERGED) { totalCount }
      closedPRs: pullRequests(states: CLOSED) { totalCount }
      releases { totalCount }
      mentionableUsers { totalCount }
    }
  }
`;

export interface RepoStatsQueryResult {
  repository: {
    defaultBranchRef: {
      target: {
        history: { totalCount: number };
      };
    } | null;
    issues: { totalCount: number };
    closedIssues: { totalCount: number };
    pullRequests: { totalCount: number };
    mergedPRs: { totalCount: number };
    closedPRs: { totalCount: number };
    releases: { totalCount: number };
    mentionableUsers: { totalCount: number };
  } | null;
}
