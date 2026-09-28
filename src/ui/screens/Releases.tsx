import React from 'react';
import { Box, Text } from 'ink';
import { AggregatedStats, RepoData } from '../../types/index.js';

interface ReleasesProps {
  stats: AggregatedStats;
  repos: RepoData[];
}

export const Releases: React.FC<ReleasesProps> = ({ stats, repos }) => {
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
            <Text bold color="gray">{'Repository'.padEnd(40)}{'Releases'}</Text>
          </Box>
          <Text color="gray">{'-'.repeat(50)}</Text>
          {reposWithReleases.length > 0 ? (
            reposWithReleases.map((repo) => (
              <Box key={repo.id}>
                <Text color="cyan">{repo.name.substring(0, 38).padEnd(40)}</Text>
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
