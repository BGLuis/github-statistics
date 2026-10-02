import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveToken } from '../src/auth/token.js';

describe('resolveToken', () => {
  it('prefers GITHUB_TOKEN over the gh CLI so the account can be overridden', () => {
    const token = resolveToken({ GITHUB_TOKEN: 'from-env' }, () => 'from-gh');

    assert.equal(token, 'from-env');
  });

  it('falls back to the gh CLI token', () => {
    assert.equal(resolveToken({}, () => 'from-gh'), 'from-gh');
  });

  it('falls back to gh when GITHUB_TOKEN is empty', () => {
    assert.equal(resolveToken({ GITHUB_TOKEN: '' }, () => 'from-gh'), 'from-gh');
  });

  it('explains how to authenticate when no token is available', () => {
    const failing = () => {
      throw new Error('gh: not logged in');
    };

    assert.throws(() => resolveToken({}, failing), /gh auth login[\s\S]*GITHUB_TOKEN/);
    assert.throws(() => resolveToken({}, () => ''), /No GitHub token found/);
  });
});
