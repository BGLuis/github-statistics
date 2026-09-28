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
  totalCommits: number;
  linesAdded: number;   // total lines added across all commits
  linesDeleted: number; // total lines deleted across all commits
  releases: number;
  contributors: number;
  commitActivity: WeeklyActivity[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  htmlUrl: string;
}

export interface WeeklyActivity {
  week: number; // unix timestamp
  total: number;
  days: number[];
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
  avgRepoSize: number;
  totalSizeKB: number;
  totalBytes: number;           // sum of all language bytes
  totalLinesEstimate: number;   // estimated current lines (bytes / 40)
  languages: Record<string, number>; // language -> total bytes
  topics: Record<string, number>;    // topic -> count
  topRepos: RepoData[];
  monthlyCommits: Record<string, number>; // 'YYYY-MM' -> count
}



export interface CacheData {
  username: string;
  fetchedAt: string;
  repos: RepoData[];
  aggregated: AggregatedStats;
  filters: FilterOptions;
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
