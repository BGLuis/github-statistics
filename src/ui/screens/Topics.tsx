import React from 'react';
import { Box, Text } from 'ink';
import { AggregatedStats } from '../../types/index.js';
import { BarChart } from '../components/BarChart.js';

interface TopicsProps {
  stats: AggregatedStats;
}

export const Topics: React.FC<TopicsProps> = ({ stats }) => {
  const sorted = Object.entries(stats.topics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);

  const items = sorted.map(([topic, count]) => ({
    label: topic,
    value: count,
    color: 'magenta',
  }));

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan" underline>{'🏷  Topics & Tags'}</Text>
      <Box marginTop={1}>
        {items.length > 0 ? (
          <BarChart items={items} maxBarWidth={30} valueFormatter={(v) => `×${v}`} />
        ) : (
          <Text color="gray">No topics found in repositories.</Text>
        )}
      </Box>
    </Box>
  );
};
