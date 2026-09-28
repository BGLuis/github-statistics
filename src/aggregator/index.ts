import dayjs from 'dayjs';
import { AggregatedStats, RepoData } from '../types/index.js';

export function aggregateStats(repos: RepoData[]): AggregatedStats {
  const languages: Record<string, number> = {};
  const topics: Record<string, number> = {};
  const monthlyCommits: Record<string, number> = {};

  let totalStars = 0;
  let totalForks = 0;
  let totalWatchers = 0;
  let totalCommits = 0;
  let totalLinesAdded = 0;
  let totalLinesDeleted = 0;
  let totalIssuesOpen = 0;
  let totalIssuesClosed = 0;
  let totalPRsOpen = 0;
  let totalPRsMerged = 0;
  let totalPRsClosed = 0;
  let totalReleases = 0;
  let totalSizeKB = 0;

  for (const repo of repos) {
    totalStars += repo.stars;
    totalForks += repo.forks;
    totalWatchers += repo.watchers;
    totalCommits += repo.totalCommits;
    totalLinesAdded += repo.linesAdded;
    totalLinesDeleted += repo.linesDeleted;
    totalIssuesOpen += repo.openIssues;
    totalIssuesClosed += repo.closedIssues;
    totalPRsOpen += repo.openPRs;
    totalPRsMerged += repo.mergedPRs;
    totalPRsClosed += repo.closedPRs;
    totalReleases += repo.releases;
    totalSizeKB += repo.size;

    // Accumulate languages
    for (const [lang, bytes] of Object.entries(repo.languages)) {
      languages[lang] = (languages[lang] ?? 0) + bytes;
    }

    // Accumulate topics
    for (const topic of repo.topics) {
      topics[topic] = (topics[topic] ?? 0) + 1;
    }

    // Accumulate commit activity
    for (const week of repo.commitActivity) {
      const month = dayjs.unix(week.week).format('YYYY-MM');
      monthlyCommits[month] = (monthlyCommits[month] ?? 0) + week.total;
    }
  }


  const sortedRepos = [...repos].sort((a, b) => b.stars - a.stars);

  const totalBytes = Object.values(languages).reduce((s, b) => s + b, 0);
  // Rough estimate: average ~40 bytes per line of source code
  const totalLinesEstimate = Math.round(totalBytes / 40);

  return {
    totalStars,
    totalForks,
    totalWatchers,
    totalRepos: repos.length,
    totalCommits,
    totalLinesAdded,
    totalLinesDeleted,
    totalIssuesOpen,
    totalIssuesClosed,
    totalPRsOpen,
    totalPRsMerged,
    totalPRsClosed,
    totalReleases,
    avgRepoSize: repos.length > 0 ? Math.round(totalSizeKB / repos.length) : 0,
    totalSizeKB,
    totalBytes,
    totalLinesEstimate,
    languages,
    topics,
    topRepos: sortedRepos.slice(0, 10),
    monthlyCommits,
  };
}

