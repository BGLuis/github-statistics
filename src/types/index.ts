export interface RepoData {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  stars: number;
  forks: number;
  watchers: number;
  size: number; // KB
  language: string | null;
  topics: string[];
  languages: Record<string, number>; // language -> bytes
  openIssues: number;
  closedIssues: number;
  openPRs: number;
  mergedPRs: number;
  closedPRs: number;
  totalCommits: number; // commits by the analysed user on the default branch
  linesAdded: number;   // lines added by the analysed user
  linesDeleted: number; // lines deleted by the analysed user
  releases: number;
  commitActivity: WeeklyActivity[]; // commits by the analysed user, per week
  statsStatus: StatsStatus;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  htmlUrl: string;
}

export type StatsStatus = 'ok' | 'skipped' | 'unavailable';

export interface WeeklyActivity {
  week: number; // unix timestamp
  total: number;
}

export interface AggregatedStats {
  totalStars: number;
  totalForks: number;
  totalWatchers: number;
  totalRepos: number;
  totalCommits: number;
  totalLinesAdded: number;   // sum of all lines added across all repos/commits
  totalLinesDeleted: number; // sum of all lines deleted
  totalIssuesOpen: number;
  totalIssuesClosed: number;
  totalPRsOpen: number;
  totalPRsMerged: number;
  totalPRsClosed: number;
  totalReleases: number;
  reposStatsUnavailable: number; // repos whose line/activity stats could not be fetched
  avgRepoSize: number;
  totalSizeKB: number;
  totalBytes: number;           // sum of all language bytes
  totalLinesEstimate: number;   // estimated current lines (bytes / 40)
  languages: Record<string, number>; // language -> total bytes
  topics: Record<string, number>;    // topic -> count
  topRepos: RepoData[];
  monthlyCommits: Record<string, number>; // 'YYYY-MM' -> count
}

export interface GitHubUser {
  login: string;
  id: string; // GraphQL node id
}

export interface CacheData {
  version: number;
  username: string;
  fetchedAt: string;
  repos: RepoData[];
  filters: FilterOptions;
  fast: boolean;
}

export interface FilterOptions {
  scope: 'public' | 'private' | 'all';
  includeForks: boolean;
  includeOrgs: boolean;
}

export interface CLIOptions {
  scope: 'public' | 'private' | 'all';
  includeForks: boolean;
  includeOrgs: boolean;
  noCache: boolean;
  fast: boolean;
  user?: string;
  cacheTtl: number;
  concurrency: number; // number of repos to enrich in parallel
}
