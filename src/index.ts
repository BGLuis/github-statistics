#!/usr/bin/env node
import { createRequire } from 'module';
import { Command, InvalidArgumentError, Option } from 'commander';
import React from 'react';
import { render } from 'ink';
import chalk from 'chalk';
import type { Octokit } from '@octokit/rest';
import { resolveToken } from './auth/token.js';
import { createOctokit } from './api/client.js';
import { fetchRepos, resolveUser } from './api/repos.js';
import { enrichRepos } from './api/stats.js';
import { aggregateStats } from './aggregator/index.js';
import { CACHE_VERSION, readCache, writeCache, clearCache } from './cache/manager.js';
import { App } from './ui/App.js';
import { CLIOptions, FilterOptions, GitHubUser, RepoData } from './types/index.js';

const { version } = createRequire(import.meta.url)('../package.json') as { version: string };

function integerAtLeast(min: number) {
  return (value: string): number => {
    const n = Number(value);
    if (!Number.isInteger(n) || n < min) {
      throw new InvalidArgumentError(`must be an integer >= ${min}.`);
    }
    return n;
  };
}

const program = new Command();

program
  .name('github-stats')
  .description('Interactive GitHub profile statistics dashboard')
  .version(version)
  .addOption(
    new Option('--scope <scope>', 'Repo scope: public, private, all')
      .choices(['public', 'private', 'all'])
      .default('all')
  )
  .option('--include-forks', 'Include forked repositories', false)
  .option('--include-orgs', 'Include organization repositories', false)
  .option('--no-cache', 'Skip cache, fetch fresh data')
  .option('--cache-ttl <minutes>', 'Cache TTL in minutes (0 disables reads)', integerAtLeast(0), 60)
  .option('--fast', 'Skip slow metrics (lines added/deleted, commit activity)', false)
  .option('--concurrency <number>', 'Number of concurrent requests', integerAtLeast(1), 5)
  .option('--user <username>', 'GitHub username (defaults to authenticated user)');

program.parse();
const opts = program.opts();

const cliOptions: CLIOptions = {
  scope: opts['scope'] as 'public' | 'private' | 'all',
  includeForks: opts['includeForks'] as boolean,
  includeOrgs: opts['includeOrgs'] as boolean,
  noCache: !(opts['cache'] as boolean), // commander inverts --no-cache to opts.cache = false
  fast: opts['fast'] as boolean,
  user: opts['user'] as string | undefined,
  cacheTtl: opts['cacheTtl'] as number,
  concurrency: opts['concurrency'] as number,
};

const filters: FilterOptions = {
  scope: cliOptions.scope,
  includeForks: cliOptions.includeForks,
  includeOrgs: cliOptions.includeOrgs,
};

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error(chalk.red('❌ github-stats needs an interactive terminal (TTY) to render the dashboard.'));
    process.exit(1);
  }

  let token: string;
  try {
    token = resolveToken();
  } catch (e: unknown) {
    console.error((e as Error).message);
    process.exit(1);
  }

  const octokit = createOctokit(token);

  let user: GitHubUser;
  try {
    user = await resolveUser(octokit, cliOptions.user);
  } catch (e: unknown) {
    console.error(chalk.red(`❌ Failed to resolve GitHub user: ${(e as Error).message}`));
    process.exit(1);
  }

  console.log(chalk.cyan(`⚡ github-stats — @${user.login}`));

  if (!cliOptions.noCache) {
    const cached = readCache(user.login, filters, cliOptions.fast, cliOptions.cacheTtl);
    if (cached) {
      console.log(chalk.yellow(`📦 Using cached data from ${cached.fetchedAt}`));
      renderDashboard(user, cached.repos, true, cached.fetchedAt, octokit);
      return;
    }
  }

  await fetchAndRender(user, octokit);
}

async function fetchAndRender(user: GitHubUser, octokit: Octokit) {
  console.log(chalk.gray('🔍 Fetching repositories...'));

  let repos: RepoData[];
  try {
    repos = await fetchRepos(octokit, user, filters, (count) => {
      process.stdout.write(`\r  Found ${count} repos...`);
    });
  } catch (e: unknown) {
    console.error(chalk.red('❌ Failed to fetch repositories:', (e as Error).message));
    process.exit(1);
  }

  process.stdout.write('\n');
  if (!cliOptions.fast) {
    console.log(chalk.gray(`📊 Computing your commit stats for ${repos.length} repositories...`));
    console.log(chalk.gray('   (GitHub may take a while to compute these for large profiles)'));
  }

  const enriched = await enrichRepos(
    repos,
    octokit,
    user.login,
    cliOptions.fast,
    cliOptions.concurrency,
    (done, total, repoName) => {
      process.stdout.write(`\r  [${done}/${total}] ${repoName}...`.padEnd(60));
    }
  );
  process.stdout.write('\n');

  const unavailable = enriched.filter((r) => r.statsStatus === 'unavailable').length;
  if (unavailable > 0) {
    console.log(chalk.yellow(`⚠️  ${unavailable} repositories had no line/activity stats available.`));
  }

  const fetchedAt = new Date().toISOString();
  writeCache({
    version: CACHE_VERSION,
    username: user.login,
    fetchedAt,
    repos: enriched,
    filters,
    fast: cliOptions.fast,
  });

  renderDashboard(user, enriched, false, fetchedAt, octokit);
}

function renderDashboard(
  user: GitHubUser,
  repos: RepoData[],
  cached: boolean,
  fetchedAt: string,
  octokit: Octokit
) {
  console.clear();

  const instance = render(
    React.createElement(App, {
      username: user.login,
      stats: aggregateStats(repos),
      repos,
      cached,
      fetchedAt: new Date(fetchedAt).toLocaleString(),
      fast: cliOptions.fast,
      onReload: () => {
        clearCache(user.login);
        instance.unmount();
        void fetchAndRender(user, octokit);
      },
    })
  );
}

main().catch((err: unknown) => {
  console.error(chalk.red('Fatal error:', (err as Error).message));
  process.exit(1);
});
