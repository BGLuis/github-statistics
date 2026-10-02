import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough, Writable } from 'node:stream';
import React from 'react';
import stringWidth from 'string-width';
import { aggregateStats } from '../src/aggregator/index.js';
import { MIN_ROWS, computeLayout, readTerminalSize } from '../src/ui/layout.js';
import { enterAltScreen, leaveAltScreen, repaintOnResize } from '../src/ui/terminal.js';
import { makeRepo } from './helpers.js';

describe('computeLayout', () => {
  it('keeps the frame shorter than the terminal at every supported height', () => {
    // 1 row is lost to Ink: a frame as tall as the terminal makes it wipe the whole screen.
    for (const rows of [MIN_ROWS, 28, 30, 31, 40, 80]) {
      const { contentRows, compact } = computeLayout(100, rows);
      const chrome = (compact ? 5 : 8) + (compact ? 1 : 4);
      assert.ok(chrome + contentRows <= rows - 1, `rows=${rows}`);
    }
  });

  it('switches to the compact layout exactly when the full one would not fit', () => {
    assert.equal(computeLayout(100, 30).compact, true);
    assert.equal(computeLayout(100, 31).compact, false);
  });

  it('treats a missing or zero size as "unknown" instead of shrinking everything', () => {
    assert.deepEqual(readTerminalSize({ columns: 0, rows: 0 }), { columns: 80, rows: undefined });
    assert.deepEqual(readTerminalSize(undefined), { columns: 80, rows: undefined });
    const layout = computeLayout(80, undefined);
    assert.equal(layout.contentRows, Infinity);
    assert.equal(layout.tooSmall, false);
  });

  it('flags terminals shorter than the minimum', () => {
    assert.equal(computeLayout(80, MIN_ROWS - 1).tooSmall, true);
    assert.equal(computeLayout(80, MIN_ROWS).tooSmall, false);
  });
});

describe('alternate screen', () => {
  const makeOut = () => {
    const writes: string[] = [];
    return { writes, out: { write: (s: string) => (writes.push(s), true) } as unknown as NodeJS.WriteStream };
  };

  it('is entered once and left once, however often it is called', () => {
    const { writes, out } = makeOut();
    enterAltScreen(out);
    enterAltScreen(out);
    leaveAltScreen();
    leaveAltScreen();
    assert.deepEqual(writes, ['\x1b[?1049h', '\x1b[?1049l']);
  });

  it('wipes the screen and resets Ink before Ink repaints after a resize', () => {
    const calls: string[] = [];
    const listeners: Array<() => void> = [];
    const out = {
      write: (s: string) => (calls.push(`write:${JSON.stringify(s)}`), true),
      prependListener: (_: 'resize', l: () => void) => void listeners.unshift(l),
      removeListener: (_: 'resize', l: () => void) => void listeners.splice(listeners.indexOf(l), 1),
    };
    const stop = repaintOnResize(out, { clear: () => void calls.push('ink.clear') });

    listeners.forEach((l) => l());
    assert.deepEqual(calls, ['write:"\\u001b[2J\\u001b[H"', 'ink.clear']);

    stop();
    assert.equal(listeners.length, 0);
  });
});

// Ink skips repainting when it detects CI, so the render tests need it off at import time.
const previousCi = process.env.CI;

describe('dashboard frame', () => {
  let App: typeof import('../src/ui/App.js').App;
  let render: typeof import('ink').render;

  before(async () => {
    delete process.env.CI;
    ({ App } = await import('../src/ui/App.js'));
    ({ render } = await import('ink'));
  });

  after(() => {
    if (previousCi !== undefined) process.env.CI = previousCi;
  });

  const repos = Array.from({ length: 30 }, (_, i) =>
    makeRepo({
      id: i + 1,
      name: `repository-number-${i + 1}`,
      fullName: `octo/repository-number-${i + 1}`,
      stars: 30 - i,
      releases: i + 1,
      topics: Array.from({ length: 25 }, (_, t) => `topic-${t}`),
      languages: Object.fromEntries(Array.from({ length: 20 }, (_, l) => [`Lang${l}`, (l + 1) * 1000])),
      statsStatus: 'ok',
    })
  );
  const stats = aggregateStats(repos);
  // eslint-disable-next-line no-control-regex -- stripping terminal escape sequences
  const ANSI = /\x1b\[[0-9;?]*[A-Za-z]/g;
  const CLEAR_SCROLLBACK = '\x1b[3J';
  const settle = () => new Promise((resolve) => setTimeout(resolve, 70));

  async function openDashboard(columns: number, rows: number | undefined) {
    const writes: string[] = [];
    const stdout = Object.assign(
      new Writable({ write: (chunk, _enc, cb) => (writes.push(chunk.toString()), cb()) }),
      { columns, rows, isTTY: true }
    );
    const stdin = Object.assign(new PassThrough(), {
      isTTY: true,
      setRawMode: () => undefined,
      ref: () => undefined,
      unref: () => undefined,
    });
    const instance = render(
      React.createElement(App, { username: 'octo', stats, repos, fast: false, onReload: () => undefined }),
      { stdout: stdout as never, stdin: stdin as never, exitOnCtrlC: false, patchConsole: false }
    );
    await settle();
    // Ink also writes escape-only chunks (hide cursor), which are not frames.
    const lastFrame = () => {
      const text = writes.map((w) => w.replace(ANSI, '')).filter((w) => w.trim() !== '');
      return text[text.length - 1].replace(/\n$/, '').split('\n');
    };
    const press = async (key: string) => {
      stdin.write(key);
      await settle();
    };
    return { writes, lastFrame, press, close: () => instance.unmount() };
  }

  const sizes: Array<[number, number]> = [[80, 24], [100, 28], [100, 30], [100, 31], [120, 50], [60, 24]];

  for (const [columns, rows] of sizes) {
    it(`fits all 7 panels in ${columns}x${rows} without wiping the terminal`, async () => {
      const d = await openDashboard(columns, rows);
      try {
        for (let panel = 1; panel <= 7; panel++) {
          await d.press(String(panel));
          const frame = d.lastFrame();

          assert.ok(frame.length <= rows - 1, `panel ${panel}: ${frame.length} lines in ${rows} rows`);
          assert.ok(frame.every((l) => stringWidth(l) <= columns), `panel ${panel}: a line is wider than ${columns}`);
          assert.ok(frame.join('\n').includes('github-stats'), `panel ${panel}: header scrolled off`);
          assert.ok(frame.join('\n').includes('quit'), `panel ${panel}: footer scrolled off`);
        }
        assert.ok(
          d.writes.every((w) => !w.includes(CLEAR_SCROLLBACK)),
          'Ink wiped the terminal, which is what leaves junk at the top'
        );
      } finally {
        d.close();
      }
    });
  }

  it('asks for a taller terminal instead of rendering a broken frame', async () => {
    const d = await openDashboard(80, MIN_ROWS - 1);
    try {
      assert.match(d.lastFrame().join('\n'), /Terminal too small/);
    } finally {
      d.close();
    }
  });

  it('renders normally when the pty reports no size', async () => {
    const d = await openDashboard(0, 0);
    try {
      assert.match(d.lastFrame().join('\n'), /Overview/);
    } finally {
      d.close();
    }
  });
});
