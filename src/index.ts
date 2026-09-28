#!/usr/bin/env node
import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import chalk from 'chalk';
import { resolveToken } from './auth/token.js';
import { getRestClient } from './api/client.js';
import { fetchRepos } from './api/repos.js';
import { enrichRepos } from './api/stats.js';
import { aggregateStats } from './aggregator/index.js';
import { readCache, writeCache, clearCache } from './cache/manager.js';
import { App } from './ui/App.js';
import { CLIOptions, FilterOptions, CacheData, RepoData, AggregatedStats } from './types/index.js';

const program = new Command();

program
  .name('github-stats')
  .description('Interactive GitHub profile statistics dashboard')
  .version('1.0.0')
  .option('--scope <scope>', 'Repo scope: public, private, all', 'all')
  .option('--include-forks', 'Include forked repositories', false)
  .option('--include-orgs', 'Include organization repositories', false)
  .option('--no-cache', 'Skip cache, fetch fresh data')
  .option('--cache-ttl <minutes>', 'Cache TTL in minutes', '60')
  .option('--fast', 'Skip slow metrics (commit activity, contributors)', false)
  .option('--concurrency <number>', 'Number of concurrent requests (default: 5)', '5')
  .option('--user <username>', 'GitHub username (defaults to authenticated user)');

program.parse();
const opts = program.opts();

const cliOptions: CLIOptions = {
  scope: opts['scope'] as 'public' | 'private' | 'all',
  includeForks: opts['includeForks'] as boolean,
  includeOrgs: opts['includeOrgs'] as boolean,
  noCache: !(opts['cache'] as boolean),  // commander inverts --no-cache to opts.cache = false
  fast: opts['fast'] as boolean,
  user: opts['user'] as string | undefined,
  cacheTtl: parseInt(opts['cacheTtl'] as string) || 60,
  concurrency: Math.max(1, parseInt(opts['concurrency'] as string) || 5),
};

const filters: FilterOptions = {
  scope: cliOptions.scope,
  includeForks: cliOptions.includeForks,
  includeOrgs: cliOptions.includeOrgs,
};

async function main() {
  let token: string;
  try {
    token = resolveToken();
  } catch (e: unknown) {
    console.error((e as Error).message);
    process.exit(1);
  }

  const octokit = getRestClient(token);

  // Resolve username
  let username = cliOptions.user;
  if (!username) {
    try {
      const { data } = await octokit.rest.users.getAuthenticated();
      username = data.login;
    } catch {
      console.error(chalk.red('❌ Failed to get authenticated user. Check your token.'));
      process.exit(1);
    }
  }

  console.log(chalk.cyan(`⚡ github-stats — @${username}`));

  // Try cache first
  if (!cliOptions.noCache) {
    const cached = readCache(username, filters, cliOptions.cacheTtl);
    if (cached) {
      console.log(chalk.yellow(`📦 Using cached data from ${cached.fetchedAt}`));
      renderDashboard(username, cached.repos, cached.aggregated, true, cached.fetchedAt, token, octokit);
      return;
    }
  }

  await fetchAndRender(username, token, octokit);
}

async function fetchAndRender(username: string, token: string, octokit: ReturnType<typeof getRestClient>) {
  console.log(chalk.gray('🔍 Fetching repositories...'));

  let repos;
  try {
    repos = await fetchRepos(octokit, username, filters, (count) => {
      process.stdout.write(`\r  Found ${count} repos...`);
    });
  } catch (e: unknown) {
    console.error(chalk.red('❌ Failed to fetch repositories:', (e as Error).message));
    process.exit(1);
  }

  process.stdout.write('\n');
  console.log(chalk.gray(`📊 Enriching ${repos.length} repositories with detailed stats...`));
  console.log(chalk.gray('   (This may take a while for large profiles)'));

  const enriched = await enrichRepos(
    repos,
    octokit,
    token,
    cliOptions.fast,
    cliOptions.concurrency,
    (done, total, repoName) => {
      process.stdout.write(`\r  [${done}/${total}] ${repoName ?? ''}...`.padEnd(60));
    }
  );
  process.stdout.write('\n');

  const aggregated = aggregateStats(enriched);
  const fetchedAt = new Date().toISOString();

  // Save to cache
  const cacheData: CacheData = {
    username: username,
    fetchedAt,
    repos: enriched,
    aggregated,
    filters,
  };
  writeCache(cacheData);

  renderDashboard(username, enriched, aggregated, false, fetchedAt, token, octokit);
}

function renderDashboard(
  username: string,
  repos: RepoData[],
  aggregated: AggregatedStats,
  cached: boolean,
  fetchedAt: string,
  token: string,
  octokit: ReturnType<typeof getRestClient>
) {
  // Clear screen
  console.clear();

  let instance: ReturnType<typeof render>;

  const handleReload = () => {
    clearCache();
    instance.unmount();
    fetchAndRender(username, token, octokit);
  };

  instance = render(
    React.createElement(App, {
      username,
      stats: aggregated,
      repos,
      cached,
      fetchedAt: new Date(fetchedAt).toLocaleString(),
      fast: cliOptions.fast,
      onReload: handleReload,
    })
  );
}


main().catch((err: unknown) => {
  console.error(chalk.red('Fatal error:', (err as Error).message));
  process.exit(1);
});
