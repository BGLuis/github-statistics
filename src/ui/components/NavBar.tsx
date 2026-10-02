import React from 'react';
import { Box, Text } from 'ink';

interface NavBarProps {
  labels: string[];
  activeIndex: number;
}

export const NavBar: React.FC<NavBarProps> = ({ labels, activeIndex }) => {
  return (
    <Box flexWrap="wrap">
      {labels.map((panel, i) => (
        <Box key={panel} marginRight={1} flexShrink={0}>
          <Text
            bold={i === activeIndex}
            color={i === activeIndex ? 'cyan' : 'gray'}
            underline={i === activeIndex}
          >
            {i === activeIndex ? `[${panel}]` : panel}
          </Text>
        </Box>
      ))}
    </Box>
  );
};
