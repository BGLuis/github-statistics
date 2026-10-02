import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  username: string;
  cached?: boolean;
  fetchedAt?: string;
}

export const Header: React.FC<HeaderProps> = ({ username, cached, fetchedAt }) => {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
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
