import React from 'react';
import { Box, Text } from 'ink';
import { Panel } from '../components/Panel.js';
import { useLayout } from '../LayoutContext.js';
import { AggregatedStats } from '../../types/index.js';

interface ActivityProps {
  stats: AggregatedStats;
  fast?: boolean;
}

const SPARK = [' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

export const Activity: React.FC<ActivityProps> = ({ stats, fast }) => {
  const { gap } = useLayout();
  const hasData = Object.values(stats.monthlyCommits).some((v) => v > 0);

  // Get last 12 months
  const months: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(d.toISOString().slice(0, 7));
  }

  const values = months.map((m) => stats.monthlyCommits[m] ?? 0);
  const maxVal = Math.max(...values, 1);

  const sparkLine = values.map((v) => {
    const idx = v > 0 ? Math.max(1, Math.round((v / maxVal) * (SPARK.length - 1))) : 0;
    return SPARK[idx];
  }).join('');

  const items = months.map((m, i) => ({ month: m, commits: values[i] }));

  return (
    <Panel title="📅 Your Commit Activity (last 12 months)">
      {!hasData ? (
        <Text color="yellow">
          {fast
            ? '🐇 Fast mode active — commit activity not collected.\n   Re-run without --fast to see this chart.'
            : '📭 No commits by you found for the last 12 months.'}
        </Text>
      ) : (
        <>
          <Text color="green">{sparkLine}</Text>
          <Box marginTop={gap} flexDirection="column">
            {items.map(({ month, commits }) => (
              <Box key={month}>
                <Text color="gray">{month}  </Text>
                <Text color="green">{'▉'.repeat(Math.min(commits > 0 ? Math.max(1, Math.round((commits / maxVal) * 40)) : 0, 40))}</Text>
                <Text color="white"> {commits.toLocaleString()}</Text>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Panel>
  );
};

