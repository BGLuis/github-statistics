import React from 'react';
import { Box, Text } from 'ink';
import stringWidth from 'string-width';
import { padCols, truncateCols } from '../format.js';
import { useLayout } from '../LayoutContext.js';

const PANEL_CHROME = 6;
const MIN_BAR_WIDTH = 5;
const MIN_LABEL_WIDTH = 8;

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
  const { columns } = useLayout();

  if (items.length === 0) return <Text color="gray">No data</Text>;

  const maxValue = Math.max(...items.map((i) => i.value));
  const labelLimit = Math.max(MIN_LABEL_WIDTH, Math.floor((columns - PANEL_CHROME) / 3));
  const maxLabelLen = Math.min(labelLimit, Math.max(...items.map((i) => stringWidth(i.label))));
  const maxValueLen = showValues
    ? Math.max(...items.map((i) => stringWidth(valueFormatter(i.value)))) + 1
    : 0;
  const available = columns - PANEL_CHROME - maxLabelLen - 1 - maxValueLen;
  const barWidth = Math.max(MIN_BAR_WIDTH, Math.min(maxBarWidth, available));

  return (
    <Box flexDirection="column">
      {items.map((item) => {
        const barLen = item.value > 0 ? Math.max(1, Math.round((item.value / maxValue) * barWidth)) : 0;
        const bar = '█'.repeat(barLen);
        const label = padCols(truncateCols(item.label, maxLabelLen), maxLabelLen);
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
