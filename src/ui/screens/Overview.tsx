import React from 'react';
import { Box, Text } from 'ink';
import { AggregatedStats } from '../../types/index.js';
import { padCols } from '../format.js';

interface OverviewProps {
  stats: AggregatedStats;
  fast?: boolean;
}

const fmt = (n: number) => n.toLocaleString();
const fmtSize = (kb: number) => {
  if (kb > 1024 * 1024) return `${(kb / 1024 / 1024).toFixed(1)} GB`;
  if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
};
const fmtLines = (n: number) => {
  if (n >= 1_000_000) return `~${(n / 1_000_000).toFixed(1)}M lines`;
  if (n >= 1_000) return `~${(n / 1_000).toFixed(1)}K lines`;
  return `~${n} lines`;
};

const Stat: React.FC<{ emoji: string; label: string; value: string | number; dim?: boolean }> = ({
  emoji,
  label,
  value,
  dim,
}) => (
  <Box marginBottom={0}>
    <Text>{padCols(emoji.trim(), 2)} </Text>
    <Text color="gray">{padCols(label, 26)}</Text>
    <Text bold color={dim ? 'gray' : 'white'}>{String(value)}</Text>
  </Box>
);

export const Overview: React.FC<OverviewProps> = ({ stats, fast }) => {
  const hasLineData = stats.totalLinesAdded > 0 || stats.totalLinesDeleted > 0;
  const lineNote = fast ? '(run without --fast)' : '(unavailable)';

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan" underline>📊 Overview</Text>
      <Box marginTop={1} flexDirection="column">
        <Stat emoji="📦" label="Repositories"        value={fmt(stats.totalRepos)} />
        <Stat emoji="🌟" label="Total Stars"          value={fmt(stats.totalStars)} />
        <Stat emoji="🍴" label="Total Forks"          value={fmt(stats.totalForks)} />
        <Stat emoji="👁 " label="Total Watchers"      value={fmt(stats.totalWatchers)} />
        <Stat emoji="📝" label="Commits (you)"        value={fmt(stats.totalCommits)} />
        <Stat emoji="🟢" label="Lines Added (you)"  value={hasLineData ? fmt(stats.totalLinesAdded) : lineNote} dim={!hasLineData} />
        <Stat emoji="🔴" label="Lines Deleted (you)" value={hasLineData ? fmt(stats.totalLinesDeleted) : lineNote} dim={!hasLineData} />
        <Stat emoji="🔢" label="Lines of Code (est.)" value={stats.totalLinesEstimate > 0 ? fmtLines(stats.totalLinesEstimate) : '—'} />
        <Stat emoji="📏" label="Avg Repo Size"        value={fmtSize(stats.avgRepoSize)} />
        <Stat emoji="💾" label="Total Size"           value={fmtSize(stats.totalSizeKB)} />
        <Stat emoji="🐛" label="Open Issues"          value={fmt(stats.totalIssuesOpen)} />
        <Stat emoji="🔒" label="Closed Issues"        value={fmt(stats.totalIssuesClosed)} />
        <Stat emoji="🔀" label="PRs Merged"           value={fmt(stats.totalPRsMerged)} />
        <Stat emoji="🏷 " label="Total Releases"      value={fmt(stats.totalReleases)} />
      </Box>
      {fast && (
        <Box marginTop={1}>
          <Text color="yellow">🐇 Fast mode: commit activity + line stats skipped. Run without --fast for full data.</Text>
        </Box>
      )}
      {!fast && stats.reposStatsUnavailable > 0 && (
        <Box marginTop={1}>
          <Text color="yellow">
            ⚠ {stats.reposStatsUnavailable} repo(s) sem estatísticas de linhas/atividade (GitHub ainda calculando ou erro). Rode novamente com --no-cache
          </Text>
        </Box>
      )}
    </Box>
  );
};

