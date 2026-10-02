const ENTER_ALT_SCREEN = '\x1b[?1049h';
const LEAVE_ALT_SCREEN = '\x1b[?1049l';
const CLEAR_SCREEN = '\x1b[2J\x1b[H';

type Output = Pick<NodeJS.WriteStream, 'write'>;

let altScreenOutput: Output | null = null;

function restoreOnExit(): void {
  leaveAltScreen();
}

/**
 * The dashboard lives on the terminal's alternate screen, like vim or htop: it never
 * mixes with the scrollback (a visible mess over SSH) and the shell comes back clean.
 */
export function enterAltScreen(out: Output = process.stdout): void {
  if (altScreenOutput) return;
  altScreenOutput = out;
  out.write(ENTER_ALT_SCREEN);
  process.once('exit', restoreOnExit);
  // Without a handler these signals end the process without running 'exit' hooks.
  process.once('SIGTERM', () => process.exit(143));
  process.once('SIGHUP', () => process.exit(129));
}

export function leaveAltScreen(): void {
  if (!altScreenOutput) return;
  altScreenOutput.write(LEAVE_ALT_SCREEN);
  altScreenOutput = null;
  process.removeListener('exit', restoreOnExit);
}

interface Clearable {
  clear(): void;
}

interface Resizable extends Output {
  prependListener(event: 'resize', listener: () => void): unknown;
  removeListener(event: 'resize', listener: () => void): unknown;
}

/**
 * Ink erases its previous frame by moving up one line per logical line, which breaks
 * once a resize re-wraps lines. Wiping the screen and resetting Ink's bookkeeping first
 * makes its own resize handler (which runs after this one) repaint from a clean slate.
 */
export function repaintOnResize(out: Resizable, ink: Clearable): () => void {
  const onResize = () => {
    out.write(CLEAR_SCREEN);
    ink.clear();
  };
  out.prependListener('resize', onResize);
  return () => {
    out.removeListener('resize', onResize);
  };
}
