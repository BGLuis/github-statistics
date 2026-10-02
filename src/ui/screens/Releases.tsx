import React from 'react';
import { Box, Text } from 'ink';
import { AggregatedStats, RepoData } from '../../types/index.js';
import { padCols, truncateCols } from '../format.js';
import { useTerminalColumns } from '../useTerminalColumns.js';

const PANEL_CHROME = 6;
const RELEASES_WIDTH = 10;
const MIN_NAME_WIDTH = 15;
const MAX_NAME_WIDTH = 40;

interface ReleasesProps {
  stats: AggregatedStats;
  repos: RepoData[];
}

export const Releases: React.FC<ReleasesProps> = ({ stats, repos }) => {
  const columns = useTerminalColumns();
  const nameWidth = Math.max(MIN_NAME_WIDTH, Math.min(MAX_NAME_WIDTH, columns - PANEL_CHROME - RELEASES_WIDTH));
  const reposWithReleases = repos
    .filter((r) => r.releases > 0)
    .sort((a, b) => b.releases - a.releases)
    .slice(0, 15);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan" underline>🚀 Releases</Text>
      <Box marginTop={1} flexDirection="column">
        <Text color="gray">Total releases across all repos: <Text bold color="white">{stats.totalReleases.toLocaleString()}</Text></Text>
        <Box marginTop={1} flexDirection="column">
          <Box>
            <Text bold color="gray">{padCols('Repository', nameWidth)}{'Releases'}</Text>
          </Box>
          <Text color="gray">{'-'.repeat(nameWidth + 8)}</Text>
          {reposWithReleases.length > 0 ? (
            reposWithReleases.map((repo) => (
              <Box key={repo.id}>
                <Text color="cyan">{padCols(truncateCols(repo.name, nameWidth - 2), nameWidth)}</Text>
                <Text color="yellow">{'🏷  ' + repo.releases}</Text>
              </Box>
            ))
          ) : (
            <Text color="gray">No releases found.</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};
