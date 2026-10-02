import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  username: string;
  cached?: boolean;
  fetchedAt?: string;
  compact?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ username, cached, fetchedAt, compact }) => {
  const border = compact ? {} : { borderStyle: 'round' as const, borderColor: 'cyan' };
  return (
    <Box flexDirection="column" paddingX={1} {...border}>
      <Box justifyContent="space-between">
        <Text bold color="cyan">
          {'📈 github-stats'}
        </Text>
        <Text color="gray">
          {'@'}{username}
        </Text>
        {cached && (
          <Text color="yellow"> (cached {fetchedAt})</Text>
        )}
      </Box>
    </Box>
  );
};
