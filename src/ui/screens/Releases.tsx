import React from 'react';
import { Box, Text } from 'ink';
import { AggregatedStats, RepoData } from '../../types/index.js';
import { padCols, truncateCols } from '../format.js';
import { Panel } from '../components/Panel.js';
import { useLayout } from '../LayoutContext.js';

const PANEL_CHROME = 6;
const RELEASES_WIDTH = 10;
const MIN_NAME_WIDTH = 15;
const MAX_NAME_WIDTH = 40;
// total line, header and separator, plus the gap above the header
const FIXED_ROWS = 3;

interface ReleasesProps {
  stats: AggregatedStats;
  repos: RepoData[];
}

export const Releases: React.FC<ReleasesProps> = ({ stats, repos }) => {
  const { columns, contentRows, gap } = useLayout();
  const nameWidth = Math.max(MIN_NAME_WIDTH, Math.min(MAX_NAME_WIDTH, columns - PANEL_CHROME - RELEASES_WIDTH));
  const reposWithReleases = repos
    .filter((r) => r.releases > 0)
    .sort((a, b) => b.releases - a.releases)
    .slice(0, Math.max(0, Math.min(15, contentRows - FIXED_ROWS - gap)));

  return (
    <Panel title="🚀 Releases">
      <Box flexDirection="column">
        <Text color="gray">Total releases across all repos: <Text bold color="white">{stats.totalReleases.toLocaleString()}</Text></Text>
        <Box marginTop={gap} flexDirection="column">
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
    </Panel>
  );
};
