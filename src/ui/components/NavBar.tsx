import React from 'react';
import { Box, Text } from 'ink';

const PANELS = [
  'Overview',
  'Languages',
  'Activity',
  'Top Repos',
  'Issues & PRs',
  'Topics',
  'Releases',
];

interface NavBarProps {
  activeIndex: number;
}

export const NavBar: React.FC<NavBarProps> = ({ activeIndex }) => {
  return (
    <Box>
      {PANELS.map((panel, i) => (
        <Box key={panel} marginRight={1}>
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

export { PANELS };
