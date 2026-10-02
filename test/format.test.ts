import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import stringWidth from 'string-width';
import { padCols, truncateCols } from '../src/ui/format.js';

describe('padCols', () => {
  it('pads by terminal columns so double-width emoji stay aligned', () => {
    const cells = ['abc', '🌟 12', '🍴 3', '日本'];

    for (const cell of cells) {
      assert.equal(stringWidth(padCols(cell, 10)), 10, cell);
    }
  });

  it('never truncates text that is already wider than the column', () => {
    assert.equal(padCols('abcdef', 3), 'abcdef');
  });
});

describe('truncateCols', () => {
  it('leaves text that fits untouched', () => {
    assert.equal(truncateCols('short', 10), 'short');
  });

  it('cuts to the given column width with an ellipsis, counting wide characters', () => {
    const out = truncateCols('日本語のリポジトリ名', 9);

    assert.ok(stringWidth(out) <= 9, `width ${stringWidth(out)}`);
    assert.ok(out.endsWith('…'));
  });
});
