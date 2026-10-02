import stringWidth from 'string-width';

export function padCols(text: string, width: number): string {
  return text + ' '.repeat(Math.max(0, width - stringWidth(text)));
}

export function truncateCols(text: string, width: number): string {
  if (stringWidth(text) <= width) return text;
  let out = '';
  for (const char of text) {
    if (stringWidth(out + char) > width - 1) break;
    out += char;
  }
  return out + '…';
}
