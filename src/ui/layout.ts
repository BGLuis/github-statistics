export const MIN_ROWS = 24;
// Below this height the full layout (borders + breathing room) no longer fits Overview.
const COMPACT_BELOW_ROWS = 31;
// Below this width the navbar wraps onto a second line.
const NARROW_NAV_COLUMNS = 76;
const DEFAULT_COLUMNS = 80;

export interface Layout {
  columns: number;
  rows: number | undefined;
  compact: boolean;
  /** Blank lines between sections: 1 normally, 0 in the compact layout. */
  gap: 0 | 1;
  tooSmall: boolean;
  /** Lines a panel can use below its title; Infinity when the terminal height is unknown. */
  contentRows: number;
}

/**
 * Ink repaints by erasing as many lines as the previous frame had, which cannot reach
 * above the top of the screen. A frame as tall as the terminal makes it wipe the whole
 * screen on every repaint, so the layout keeps the frame at most `rows - 1` lines tall.
 */
export function computeLayout(columns: number, rows?: number): Layout {
  const compact = rows !== undefined && rows < COMPACT_BELOW_ROWS;
  const gap = compact ? 0 : 1;
  const navRows = columns < NARROW_NAV_COLUMNS ? 2 : 1;
  const headerRows = compact ? 1 : 3;
  const panelBorderRows = 2;
  const footerRows = 1;
  const chromeRows = headerRows + navRows + gap + panelBorderRows + footerRows;
  const panelOverheadRows = 3 * gap + 1; // vertical padding, title, gap under the title

  return {
    columns,
    rows,
    compact,
    gap,
    tooSmall: rows !== undefined && rows < MIN_ROWS,
    contentRows: rows === undefined ? Infinity : Math.max(0, rows - 1 - chromeRows - panelOverheadRows),
  };
}

/** Ink and Node report 0 (not undefined) when a pty has no size, e.g. some SSH sessions. */
export function readTerminalSize(stdout?: { columns?: number; rows?: number }): {
  columns: number;
  rows: number | undefined;
} {
  return { columns: stdout?.columns || DEFAULT_COLUMNS, rows: stdout?.rows || undefined };
}
