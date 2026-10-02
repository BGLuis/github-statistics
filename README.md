<div align="center">

<!-- Badges de Status do GitHub -->
![GitHub Stars](https://www.shieldcn.dev/github/stars/bgluis/github-statistics.svg?variant=secondary&size=sm)
![GitHub Forks](https://www.shieldcn.dev/github/forks/bgluis/github-statistics.svg?variant=secondary&size=sm)
![Watchers](https://www.shieldcn.dev/github/watchers/bgluis/github-statistics.svg?variant=secondary&size=sm)
![Contributors](https://www.shieldcn.dev/github/contributors/bgluis/github-statistics.svg?theme=emerald&size=sm)
![License](https://www.shieldcn.dev/github/license/bgluis/github-statistics.svg?variant=ghost&size=sm)

<br/>

<!-- Badges das Tecnologias Utilizadas -->
![TypeScript](https://www.shieldcn.dev/badge/TypeScript-3178C6.svg?logo=typescript&variant=branded&size=sm)
![Node.js](https://www.shieldcn.dev/badge/Node.js-5FA04E.svg?logo=nodedotjs&variant=branded&size=sm)
![React / Ink](https://www.shieldcn.dev/badge/React_Ink-61DAFB.svg?logo=react&variant=branded&size=sm)
![GitHub API](https://www.shieldcn.dev/badge/GitHub_API-181717.svg?logo=github&variant=branded&size=sm)

  <h3>GitHub Statistics CLI</h3>
  Dashboard interativo no terminal para extração e visualização completa de estatísticas do perfil do GitHub.
</div>

<div align="center">
  <a href="#-português">🇧🇷 Português</a> • <a href="#-english">🇺🇸 English</a>
</div>

---

<a name="-português"></a>
## 🇧🇷 Português

# 📖 Sobre
O **github-statistics** (`github-stats`) é uma ferramenta CLI com dashboard interativo de terminal construído em Node.js e TypeScript utilizando Ink (React no terminal). Ele realiza consultas consolidadas às APIs REST e GraphQL do GitHub para extrair e apresentar métricas completas de qualquer perfil de usuário ou organização.

A aplicação inclui:
- **Painéis Navegáveis via Teclado:** Visão Geral, Linguagens (em bytes e percentual), Histórico de Atividade (sparkline de commits nos últimos 12 meses), Top Repositórios por estrelas, Issues & Pull Requests, Tópicos/Tags e Releases.
- **Métricas Abrangentes:** Contagem total de repositórios, estrelas, forks, watchers, seus commits, linhas de código estimadas, linhas adicionadas e deletadas por você ao longo da história, e tamanho médio dos repositórios.
- **Performance e Concorrência:** Os repositórios e a maior parte das métricas vêm de consultas GraphQL paginadas; apenas as estatísticas de linhas/atividade usam a API REST, em um pool de paralelismo configurável (`--concurrency`). Há também cache local em disco com TTL e tratamento automático de rate limits.

### Como as métricas são calculadas
| Métrica | Origem |
| --- | --- |
| Commits, linhas adicionadas/removidas e atividade dos últimos 12 meses | **Do usuário analisado** (commits filtrados por autor; linhas e atividade a partir das estatísticas de contribuidores do GitHub) |
| Issues, PRs, releases, estrelas, forks, tamanho, linguagens, tópicos | Totais de cada repositório |
| Watchers | Watchers reais do repositório (não é o número de estrelas) |
| Linhas de código (est.) | Bytes de código por linguagem ÷ 40 |

> O GitHub responde `202` enquanto calcula as estatísticas de linhas/atividade. Se ainda não estiverem prontas após algumas tentativas, o repositório fica **sem estatísticas** e o Overview exibe um aviso; rode novamente com `--no-cache` mais tarde.

# 📋 Motivo
O projeto nasceu porque queria extrair estatísticas do meu perfil do GitHub e não achei locais ou ferramentas disponíveis que fizessem isso de forma completa, detalhada e direto no terminal.

# 💻 Como iniciar

### Requisitos
- [Node.js](https://nodejs.org/) (versão `>= 20`)
- [npm](https://www.npmjs.com/)
- [GitHub CLI (gh)](https://cli.github.com/) (opcional, para autenticação automática simplificada)
- Um terminal interativo (TTY): a CLI encerra com erro se a saída for redirecionada ou executada em pipe

### Autenticação
A CLI suporta autenticação através de variável de ambiente ou do GitHub CLI (`gh`). Se `GITHUB_TOKEN` estiver definido, ele tem prioridade; caso contrário, é usado o token do `gh`:
```sh
# Opção A: via Token de Acesso Pessoal (PAT) — tem prioridade
export GITHUB_TOKEN="ghp_seu_token_aqui"

# Opção B: via GitHub CLI
gh auth login
```

### Instalação

#### Método 1: Instalação Global (Recomendado)
Instale o comando globalmente no seu sistema:
```sh
# A partir do repositório local clonado
npm install -g .
```
Após instalado, execute de qualquer diretório:
```sh
github-stats
```

#### Método 2: Execução Local a partir do Código Fonte
1. Clone o repositório do projeto:
  ```sh
  git clone https://github.com/bgluis/github-statistics.git
  ```

2. Navegue até o diretório do projeto:
  ```sh
  cd github-statistics
  ```

3. Instale as dependências e compile o projeto:
  ```sh
  npm install
  npm run build
  ```

4. Execute a CLI:
  ```sh
  npm start
  ```

### Desenvolvimento
```sh
npm run dev      # executa src/index.ts direto com tsx (aceita as mesmas flags: npm run dev -- --fast)
npm test         # testes unitários (node:test)
npm run lint     # ESLint
npm run build    # compila para dist/
```

### Atalhos do teclado
| Tecla | Ação |
| --- | --- |
| `←` / `→` ou `h` / `l` | Painel anterior / próximo |
| `1`–`7` | Ir direto para o painel |
| `r` | Recarregar (apaga o cache do usuário e busca tudo de novo) |
| `q` ou `Ctrl+C` | Sair |

### Opções e Flags CLI
```sh
github-stats [opções]

Opções:
  -V, --version           Exibe a versão instalada
  --scope <scope>         Escopo de repositórios: public, private, all (padrão: "all")
  --include-forks         Inclui repositórios clonados/forks (padrão: false)
  --include-orgs          Inclui repositórios de organizações das quais participa (padrão: false)
  --no-cache              Ignora o cache local e busca dados atualizados
  --cache-ttl <minutes>   Tempo de vida do cache em minutos; 0 desativa a leitura (padrão: 60)
  --fast                  Modo rápido: pula linhas adicionadas/removidas e atividade de commits
  --concurrency <number>  Número de requisições paralelas simultâneas, inteiro >= 1 (padrão: 5)
  --user <username>       Usuário do GitHub a analisar (padrão: usuário autenticado)
  -h, --help              Exibe o guia de ajuda
```

- **`--scope`** filtra por visibilidade (`public`, `private` ou `all`).
- **`--include-orgs`**: sem a flag, entram apenas repositórios próprios e de colaboração; com ela, também os de organizações das quais você é membro.
- **`--user`**: analisa outro usuário. Repositórios privados só são visíveis para o usuário autenticado, então para outras pessoas aparecem apenas os públicos.

### Cache
Os dados ficam em `~/.github-stats/cache-<usuario>.json` (um arquivo por usuário, com permissão `0600` e diretório `0700`, pois podem conter dados de repositórios privados). O cache só é reaproveitado quando usuário, filtros (`--scope`, `--include-forks`, `--include-orgs`) e `--fast` coincidem e o TTL não expirou. `--cache-ttl 0` desativa a leitura do cache.

---

<a name="-english"></a>
## 🇺🇸 English

# 📖 About
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

# 📋 Motivation
This project was born out of the need to extract comprehensive statistics from my GitHub profile after not finding existing tools or platforms that provided this detailed data directly in the terminal.

# 💻 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (`>= 20`)
- [npm](https://www.npmjs.com/)
- [GitHub CLI (gh)](https://cli.github.com/) (optional, for streamlined authentication)
- An interactive terminal (TTY): the CLI exits with an error when output is redirected or piped

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

# 🤝 Contribuidores / Contributors
 <a href="https://github.com/bgluis/github-statistics/graphs/contributors">
   <img src="https://contrib.rocks/image?repo=bgluis/github-statistics"/>
 </a>
