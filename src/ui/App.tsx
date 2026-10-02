import React, { useState } from 'react';
import { Box, Text, useInput, useApp, Key } from 'ink';
import { AggregatedStats, RepoData } from '../types/index.js';
import { Header } from './components/Header.js';
import { NavBar } from './components/NavBar.js';
import { Overview } from './screens/Overview.js';
import { Languages } from './screens/Languages.js';
import { Activity } from './screens/Activity.js';
import { TopRepos } from './screens/TopRepos.js';
import { Issues } from './screens/Issues.js';
import { Topics } from './screens/Topics.js';
import { Releases } from './screens/Releases.js';
import { LayoutProvider, useLayout } from './LayoutContext.js';
import { MIN_ROWS } from './layout.js';

interface AppProps {
  username: string;
  stats: AggregatedStats;
  repos: RepoData[];
  cached?: boolean;
  fetchedAt?: string;
  fast?: boolean;
  onReload: () => void;
}

interface PanelContext {
  stats: AggregatedStats;
  repos: RepoData[];
  fast?: boolean;
}

const PANELS: { label: string; render: (ctx: PanelContext) => React.ReactNode }[] = [
  { label: 'Overview', render: ({ stats, fast }) => <Overview stats={stats} fast={fast} /> },
  { label: 'Languages', render: ({ stats }) => <Languages stats={stats} /> },
  { label: 'Activity', render: ({ stats, fast }) => <Activity stats={stats} fast={fast} /> },
  { label: 'Top Repos', render: ({ stats }) => <TopRepos stats={stats} /> },
  { label: 'Issues & PRs', render: ({ stats }) => <Issues stats={stats} /> },
  { label: 'Topics', render: ({ stats }) => <Topics stats={stats} /> },
  { label: 'Releases', render: ({ stats, repos }) => <Releases stats={stats} repos={repos} /> },
];

const PANEL_LABELS = PANELS.map((p) => p.label);

const Dashboard: React.FC<AppProps> = ({ username, stats, repos, cached, fetchedAt, fast, onReload }) => {
  const layout = useLayout();
  const [panelIndex, setPanelIndex] = useState(0);
  const { exit } = useApp();

  useInput((input: string, key: Key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit();
      return;
    }
    if (input === 'r') {
      onReload();
      return;
    }
    if (key.leftArrow || input === 'h') {
      setPanelIndex((prev) => (prev - 1 + PANELS.length) % PANELS.length);
    }
    if (key.rightArrow || input === 'l') {
      setPanelIndex((prev) => (prev + 1) % PANELS.length);
    }
    const num = Number(input);
    if (/^[1-9]$/.test(input) && num <= PANELS.length) {
      setPanelIndex(num - 1);
    }
  });

  if (layout.tooSmall) {
    return (
      <Text color="yellow">
        {`Terminal too small: ${layout.rows} rows, needs at least ${MIN_ROWS}. Resize it, or press q to quit.`}
      </Text>
    );
  }

  return (
    <Box flexDirection="column">
      <Header username={username} cached={cached} fetchedAt={fetchedAt} compact={layout.compact} />
      <Box paddingX={1}>
        <NavBar labels={PANEL_LABELS} activeIndex={panelIndex} />
      </Box>
      <Box marginTop={layout.gap} borderStyle="single" borderColor="gray">
        {PANELS[panelIndex].render({ stats, repos, fast })}
      </Box>
      <Box paddingX={1}>
        <Text color="gray">{`← → navigate  1-${PANELS.length} jump  r reload  q quit`}</Text>
      </Box>
    </Box>
  );
};

export const App: React.FC<AppProps> = (props) => (
  <LayoutProvider>
    <Dashboard {...props} />
  </LayoutProvider>
);
