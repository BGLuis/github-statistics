import React, { useState } from 'react';
import { Box, Text, useInput, useApp, Key } from 'ink';
import { AggregatedStats, RepoData } from '../types/index.js';
import { Header } from './components/Header.js';
import { NavBar, PANELS } from './components/NavBar.js';
import { Overview } from './screens/Overview.js';
import { Languages } from './screens/Languages.js';
import { Activity } from './screens/Activity.js';
import { TopRepos } from './screens/TopRepos.js';
import { Issues } from './screens/Issues.js';
import { Topics } from './screens/Topics.js';
import { Releases } from './screens/Releases.js';

interface AppProps {
  username: string;
  stats: AggregatedStats;
  repos: RepoData[];
  cached?: boolean;
  fetchedAt?: string;
  fast?: boolean;
  onReload: () => void;
}

export const App: React.FC<AppProps> = ({ username, stats, repos, cached, fetchedAt, fast, onReload }) => {
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
    // Number keys 1-7
    const num = parseInt(input);
    if (!isNaN(num) && num >= 1 && num <= PANELS.length) {
      setPanelIndex(num - 1);
    }
  });

  const renderPanel = () => {
    switch (panelIndex) {
      case 0: return <Overview stats={stats} fast={fast} />;
      case 1: return <Languages stats={stats} />;
      case 2: return <Activity stats={stats} fast={fast} />;
      case 3: return <TopRepos stats={stats} />;
      case 4: return <Issues stats={stats} />;
      case 5: return <Topics stats={stats} />;
      case 6: return <Releases stats={stats} repos={repos} />;
      default: return <Overview stats={stats} fast={fast} />;
    }
  };


  return (
    <Box flexDirection="column">
      <Header username={username} cached={cached} fetchedAt={fetchedAt} />
      <Box marginTop={0} paddingX={1}>
        <NavBar activeIndex={panelIndex} />
      </Box>
      <Box marginTop={1} borderStyle="single" borderColor="gray">
        {renderPanel()}
      </Box>
      <Box marginTop={0} paddingX={1}>
        <Text color="gray">{'← → navigate  1-7 jump  r reload  q quit'}</Text>
      </Box>
    </Box>
  );
};
