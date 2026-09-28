import React from 'react';
import { Box, Text } from 'ink';
import { AggregatedStats } from '../../types/index.js';

interface TopReposProps {
  stats: AggregatedStats;
}

export const TopRepos: React.FC<TopReposProps> = ({ stats }) => {
  const repos = stats.topRepos;

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan" underline>🏆 Top Repositories (by stars)</Text>
      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text bold color="gray">
            {'#'.padEnd(4)}
            {'Name'.padEnd(35)}
            {'Stars'.padEnd(10)}
            {'Forks'.padEnd(10)}
            {'Lang'.padEnd(15)}
            {'Issues'}
          </Text>
        </Box>
        <Text color="gray">{'-'.repeat(85)}</Text>
        {repos.map((repo, i) => (
          <Box key={repo.id}>
            <Text color="gray">{String(i + 1).padEnd(4)}</Text>
            <Text color="cyan">{repo.name.substring(0, 33).padEnd(35)}</Text>
            <Text color="yellow">{String('⭐ ' + repo.stars).padEnd(10)}</Text>
            <Text color="blue">{String('🍴 ' + repo.forks).padEnd(10)}</Text>
            <Text color="green">{(repo.language ?? 'N/A').substring(0, 13).padEnd(15)}</Text>
            <Text color="red">{String('🐛 ' + repo.openIssues)}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
