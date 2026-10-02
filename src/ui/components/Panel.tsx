import React from 'react';
import { Box, Text } from 'ink';
import { useLayout } from '../LayoutContext.js';

interface PanelProps {
  title: string;
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ title, children }) => {
  const { gap } = useLayout();
  return (
    <Box flexDirection="column" paddingX={1} paddingY={gap}>
      <Text bold color="cyan" underline>{title}</Text>
      <Box marginTop={gap} flexDirection="column">
        {children}
      </Box>
    </Box>
  );
};
