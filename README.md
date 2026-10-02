<div align="center">

<!-- GitHub status badges -->
![GitHub Stars](https://www.shieldcn.dev/github/stars/bgluis/github-statistics.svg?variant=secondary&size=sm)
![GitHub Forks](https://www.shieldcn.dev/github/forks/bgluis/github-statistics.svg?variant=secondary&size=sm)
![Watchers](https://www.shieldcn.dev/github/watchers/bgluis/github-statistics.svg?variant=secondary&size=sm)
![Contributors](https://www.shieldcn.dev/github/contributors/bgluis/github-statistics.svg?theme=emerald&size=sm)
![License](https://www.shieldcn.dev/github/license/bgluis/github-statistics.svg?variant=ghost&size=sm)

<br/>

<!-- Technology badges -->
![TypeScript](https://www.shieldcn.dev/badge/TypeScript-3178C6.svg?logo=typescript&variant=branded&size=sm)
![Node.js](https://www.shieldcn.dev/badge/Node.js-5FA04E.svg?logo=nodedotjs&variant=branded&size=sm)
![React / Ink](https://www.shieldcn.dev/badge/React_Ink-61DAFB.svg?logo=react&variant=branded&size=sm)
![GitHub API](https://www.shieldcn.dev/badge/GitHub_API-181717.svg?logo=github&variant=branded&size=sm)


  <h3>GitHub Statistics CLI</h3>
  Interactive terminal dashboard to extract and visualize complete GitHub profile statistics.
</div>

<div align="center">
  🇺🇸 English • <a href="README.pt-BR.md">🇧🇷 Português</a>
</div>

---

## 📖 About
**github-statistics** (`github-stats`) is an interactive terminal CLI dashboard developed in Node.js and TypeScript powered by Ink (React for terminals). It queries both GitHub REST and GraphQL APIs to fetch and aggregate comprehensive statistics from any user profile or organization.

Features include:
- **Interactive Keyboard-Navigated Panels:** Overview, Languages (bytes & percentage breakdown), 12-Month Commit Activity (with terminal sparklines), Top Repositories sorted by stars, Issues & Pull Requests breakdown, Topics/Tags, and Releases.
- **Deep Metrics:** Total repositories, stars, forks, watchers, your commits, estimated lines of code, lines added and removed by you across commit history, and average repository size.
- **Fast & Parallelized:** Repositories and most metrics come from paginated GraphQL queries; only the line/activity statistics use the REST API, through a configurable worker pool (`--concurrency`). Local TTL-based caching and automatic rate limit handling keep API usage low.

### How metrics are computed
| Metric | Source |
| --- | --- |
| Commits, lines added/removed and 12-month activity | **The analysed user's own** (commits filtered by author; lines and activity from GitHub's contributor statistics) |
| Issues, PRs, releases, stars, forks, size, languages, topics | Repository totals |
| Watchers | Real repository watchers (not the star count) |
| Lines of code (est.) | Language bytes ÷ 40 |

> GitHub answers `202` while it computes line/activity statistics. If they are still not ready after a few retries, the repository is left **without stats** and the Overview shows a warning; run again later with `--no-cache`.

## 📋 Motivation
This project was born out of the need to extract comprehensive statistics from my GitHub profile after not finding existing tools or platforms that provided this detailed data directly in the terminal.

## 💻 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (`>= 20`)
- [npm](https://www.npmjs.com/)
- [GitHub CLI (gh)](https://cli.github.com/) (optional, for streamlined authentication)
- An interactive terminal (TTY) with at least 24 rows: the CLI exits with an error when output is redirected or piped, and the dashboard asks you to enlarge a shorter terminal. It runs on the terminal's alternate screen (like `vim`/`htop`), so it leaves nothing in your scrollback, including over SSH, and follows window resizes

### Authentication
Authenticate either using an environment variable or the GitHub CLI. `GITHUB_TOKEN` takes priority when set; otherwise the `gh` token is used:
```sh
# Option A: via Personal Access Token (PAT) — takes priority
export GITHUB_TOKEN="ghp_your_token_here"

# Option B: via GitHub CLI
gh auth login
```

### Installation

#### Method 1: Global Installation (Recommended)
Install the CLI binary globally on your machine:
```sh
# From the cloned project folder
npm install -g .
```
Then run it anywhere:
```sh
github-stats
```

#### Method 2: Local Source Execution
1. Clone the project repository:
  ```sh
  git clone https://github.com/bgluis/github-statistics.git
  ```

2. Navigate into the repository:
  ```sh
  cd github-statistics
  ```

3. Install dependencies and compile TypeScript:
  ```sh
  npm install
  npm run build
  ```

4. Launch the dashboard:
  ```sh
  npm start
  ```

### Development
```sh
npm run dev      # runs src/index.ts directly with tsx (same flags: npm run dev -- --fast)
npm test         # unit tests (node:test)
npm run lint     # ESLint
npm run build    # compile to dist/
```

### Keyboard shortcuts
| Key | Action |
| --- | --- |
| `←` / `→` or `h` / `l` | Previous / next panel |
| `1`–`7` | Jump to a panel |
| `r` | Reload (clears the user's cache and fetches everything again) |
| `q` or `Ctrl+C` | Quit |

### CLI Command Options
```sh
github-stats [options]

Options:
  -V, --version           Output version number
  --scope <scope>         Repository scope: public, private, all (default: "all")
  --include-forks         Include forked repositories (default: false)
  --include-orgs          Include repositories of organizations you belong to (default: false)
  --no-cache              Bypass local cache and fetch fresh data
  --cache-ttl <minutes>   Cache time-to-live in minutes; 0 disables cache reads (default: 60)
  --fast                  Fast mode: skip lines added/removed and commit activity
  --concurrency <number>  Number of concurrent requests, integer >= 1 (default: 5)
  --user <username>       Target GitHub username (defaults to authenticated user)
  -h, --help              Display help guide
```

- **`--scope`** filters by visibility (`public`, `private` or `all`).
- **`--include-orgs`**: without it only your own and collaborator repositories are listed; with it, repositories of organizations you are a member of are added too.
- **`--user`**: analyse another user. Private repositories are only visible to the authenticated user, so for anyone else only public ones show up.

### Cache
Data is stored in `~/.github-stats/cache-<user>.json` (one file per user, mode `0600` inside a `0700` directory, since it may contain private repository data). The cache is reused only when the user, filters (`--scope`, `--include-forks`, `--include-orgs`) and `--fast` match and the TTL has not expired. `--cache-ttl 0` disables cache reads.

## 🤝 Contributors
 <a href="https://github.com/bgluis/github-statistics/graphs/contributors">
   <img src="https://contrib.rocks/image?repo=bgluis/github-statistics"/>
 </a>
