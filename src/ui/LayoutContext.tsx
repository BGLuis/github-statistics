import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStdout } from 'ink';
import { Layout, computeLayout, readTerminalSize } from './layout.js';

const LayoutContext = createContext<Layout>(computeLayout(80));

export const useLayout = (): Layout => useContext(LayoutContext);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { stdout } = useStdout();
  const [size, setSize] = useState(() => readTerminalSize(stdout));

  useEffect(() => {
    const onResize = () => setSize(readTerminalSize(stdout));
    stdout?.on('resize', onResize);
    return () => {
      stdout?.off('resize', onResize);
    };
  }, [stdout]);

  return (
    <LayoutContext.Provider value={computeLayout(size.columns, size.rows)}>
      {children}
    </LayoutContext.Provider>
  );
};
