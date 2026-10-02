import React from 'react';
import { Box, Text } from 'ink';
import { AggregatedStats } from '../../types/index.js';
import { padCols, truncateCols } from '../format.js';
import { useTerminalColumns } from '../useTerminalColumns.js';

interface TopReposProps {
  stats: AggregatedStats;
}

const PANEL_CHROME = 6;
const RANK_WIDTH = 4;
const STARS_WIDTH = 10;
const FORKS_WIDTH = 10;
const LANG_WIDTH = 15;
const ISSUES_WIDTH = 8;
const MIN_NAME_WIDTH = 15;
const MAX_NAME_WIDTH = 35;

export const TopRepos: React.FC<TopReposProps> = ({ stats }) => {
  const columns = useTerminalColumns();
  const repos = stats.topRepos;

  const available = columns - PANEL_CHROME;
  const baseWidth = RANK_WIDTH + STARS_WIDTH + ISSUES_WIDTH;
  const showForks = available - MIN_NAME_WIDTH >= baseWidth + FORKS_WIDTH;
  const showLang = showForks && available - MIN_NAME_WIDTH >= baseWidth + FORKS_WIDTH + LANG_WIDTH;
  const fixedWidth = baseWidth + (showForks ? FORKS_WIDTH : 0) + (showLang ? LANG_WIDTH : 0);
  const nameWidth = Math.max(MIN_NAME_WIDTH, Math.min(MAX_NAME_WIDTH, available - fixedWidth));
  const tableWidth = nameWidth + fixedWidth;

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan" underline>🏆 Top Repositories (by stars)</Text>
      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text bold color="gray">
            {padCols('#', RANK_WIDTH)}
            {padCols('Name', nameWidth)}
            {padCols('Stars', STARS_WIDTH)}
            {showForks && padCols('Forks', FORKS_WIDTH)}
            {showLang && padCols('Lang', LANG_WIDTH)}
            {'Issues'}
          </Text>
        </Box>
        <Text color="gray">{'-'.repeat(tableWidth)}</Text>
        {repos.map((repo, i) => (
          <Box key={repo.id}>
            <Text color="gray">{padCols(String(i + 1), RANK_WIDTH)}</Text>
            <Text color="cyan">{padCols(truncateCols(repo.name, nameWidth - 2), nameWidth)}</Text>
            <Text color="yellow">{padCols('🌟 ' + repo.stars, STARS_WIDTH)}</Text>
            {showForks && <Text color="blue">{padCols('🍴 ' + repo.forks, FORKS_WIDTH)}</Text>}
            {showLang && (
              <Text color="green">{padCols(truncateCols(repo.language ?? 'N/A', LANG_WIDTH - 2), LANG_WIDTH)}</Text>
            )}
            <Text color="red">{'🐛 ' + repo.openIssues}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
