import React from 'react';
import { Box, Text } from 'ink';
import { Panel } from '../components/Panel.js';
import { useLayout } from '../LayoutContext.js';
import { AggregatedStats } from '../../types/index.js';
import { BarChart } from '../components/BarChart.js';

interface IssuesProps {
  stats: AggregatedStats;
}

export const Issues: React.FC<IssuesProps> = ({ stats }) => {
  const { gap } = useLayout();
  const issueItems = [
    { label: 'Open Issues   ', value: stats.totalIssuesOpen, color: 'red' },
    { label: 'Closed Issues ', value: stats.totalIssuesClosed, color: 'green' },
  ];

  const prItems = [
    { label: 'Open PRs  ', value: stats.totalPRsOpen, color: 'yellow' },
    { label: 'Merged PRs', value: stats.totalPRsMerged, color: 'green' },
    { label: 'Closed PRs', value: stats.totalPRsClosed, color: 'gray' },
  ];

  const totalIssues = stats.totalIssuesOpen + stats.totalIssuesClosed;
  const totalPRs = stats.totalPRsOpen + stats.totalPRsMerged + stats.totalPRsClosed;

  return (
    <Panel title="🐛 Issues & Pull Requests">
      <Text bold color="white">Issues (total: {totalIssues.toLocaleString()})</Text>
      <Box marginBottom={gap}>
        <BarChart items={issueItems} maxBarWidth={40} />
      </Box>
      <Text bold color="white">Pull Requests (total: {totalPRs.toLocaleString()})</Text>
      <Box>
        <BarChart items={prItems} maxBarWidth={40} />
      </Box>
    </Panel>
  );
};
