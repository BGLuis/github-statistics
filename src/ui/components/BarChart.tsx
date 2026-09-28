import React from 'react';
import { Box, Text } from 'ink';

interface BarChartProps {
  items: { label: string; value: number; color?: string }[];
  maxBarWidth?: number;
  showValues?: boolean;
  valueFormatter?: (v: number) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  items,
  maxBarWidth = 30,
  showValues = true,
  valueFormatter = (v) => v.toLocaleString(),
}) => {
  if (items.length === 0) return <Text color="gray">No data</Text>;

  const maxValue = Math.max(...items.map((i) => i.value));
  const maxLabelLen = Math.max(...items.map((i) => i.label.length));

  return (
    <Box flexDirection="column">
      {items.map((item) => {
        const barLen = maxValue > 0 ? Math.round((item.value / maxValue) * maxBarWidth) : 0;
        const bar = '█'.repeat(barLen);
        const label = item.label.padEnd(maxLabelLen);
        return (
          <Box key={item.label}>
            <Text color="gray">{label} </Text>
            <Text color={item.color ?? 'cyan'}>{bar}</Text>
            {showValues && (
              <Text color="white"> {valueFormatter(item.value)}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
