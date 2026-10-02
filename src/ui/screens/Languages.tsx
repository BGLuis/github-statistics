import React from 'react';
import { Box, Text } from 'ink';
import { AggregatedStats } from '../../types/index.js';
import { BarChart } from '../components/BarChart.js';

const COLORS = ['cyan', 'green', 'yellow', 'magenta', 'blue', 'red', 'white'];

interface LanguagesProps {
  stats: AggregatedStats;
}

const fmtBytes = (b: number) => {
  if (b > 1e9) return `${(b / 1e9).toFixed(1)}GB`;
  if (b > 1e6) return `${(b / 1e6).toFixed(1)}MB`;
  if (b > 1e3) return `${(b / 1e3).toFixed(1)}KB`;
  return `${b}B`;
};

export const Languages: React.FC<LanguagesProps> = ({ stats }) => {
  const sorted = Object.entries(stats.languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  const items = sorted.map(([lang, bytes], i) => ({
    label: lang,
    value: bytes,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan" underline>🔤 Languages (by bytes)</Text>
      <Box marginTop={1}>
        <BarChart
          items={items}
          maxBarWidth={40}
          valueFormatter={(v) => `${fmtBytes(v)} (${stats.totalBytes > 0 ? ((v / stats.totalBytes) * 100).toFixed(1) : 0}%)`}
        />
      </Box>
    </Box>
  );
};
