import React from 'react';
import { Text } from 'ink';
import { Panel } from '../components/Panel.js';
import { useLayout } from '../LayoutContext.js';
import { AggregatedStats } from '../../types/index.js';
import { BarChart } from '../components/BarChart.js';

interface TopicsProps {
  stats: AggregatedStats;
}

export const Topics: React.FC<TopicsProps> = ({ stats }) => {
  const { contentRows } = useLayout();
  const sorted = Object.entries(stats.topics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, Math.min(20, contentRows));

  const items = sorted.map(([topic, count]) => ({
    label: topic,
    value: count,
    color: 'magenta',
  }));

  return (
    <Panel title={'🏷  Topics & Tags'}>
      {items.length > 0 ? (
        <BarChart items={items} maxBarWidth={30} valueFormatter={(v) => `×${v}`} />
      ) : (
        <Text color="gray">No topics found in repositories.</Text>
      )}
    </Panel>
  );
};
