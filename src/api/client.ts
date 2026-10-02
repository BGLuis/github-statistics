import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import { retry } from '@octokit/plugin-retry';

const MAX_RATE_LIMIT_RETRIES = 2;

const ThrottledOctokit = Octokit.plugin(throttling, retry);

export function createOctokit(token: string): Octokit {
  const warnAndRetry = (kind: string) => (retryAfter: number, _options: object, _octokit: unknown, retryCount: number) => {
    if (retryCount >= MAX_RATE_LIMIT_RETRIES) return false;
    process.stderr.write(`\n  ${kind}: waiting ${retryAfter}s before retrying...\n`);
    return true;
  };

  return new ThrottledOctokit({
    auth: token,
    throttle: {
      onRateLimit: warnAndRetry('Rate limit hit'),
      onSecondaryRateLimit: warnAndRetry('Secondary rate limit hit'),
    },
  });
}
