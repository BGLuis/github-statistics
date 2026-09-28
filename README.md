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
- **Métricas Abrangentes:** Contagem total de repositórios, estrelas, forks, watchers, commits globais, linhas de código estimadas, linhas adicionadas e deletadas ao longo da história, e tamanho médio dos repositórios.
- **Performance e Concorrência:** Coleta otimizada através de um pool de paralelismo configurável (`--concurrency`), além de cache local em disco com TTL para evitar requisições redundantes e respeitar limites de taxa (rate limits).

# 📋 Motivo
O projeto nasceu porque queria extrair estatísticas do meu perfil do GitHub e não achei locais ou ferramentas disponíveis que fizessem isso de forma completa, detalhada e direto no terminal.

# 💻 Como iniciar

### Requisitos
- [Node.js](https://nodejs.org/) (versão `>= 18.0.0` recomendada)
- [npm](https://www.npmjs.com/)
- [GitHub CLI (gh)](https://cli.github.com/) (opcional, para autenticação automática simplificada)

### Autenticação
A CLI suporta autenticação através do GitHub CLI (`gh`) ou via variável de ambiente:
```sh
# Opção A: via GitHub CLI (recomendado)
gh auth login

# Opção B: via Token de Acesso Pessoal (PAT)
export GITHUB_TOKEN="ghp_seu_token_aqui"
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

### Opções e Flags CLI
```sh
github-stats [opções]

Opções:
  -V, --version           Exibe a versão instalada
  --scope <scope>         Escopo de repositórios: public, private, all (padrão: "all")
  --include-forks         Inclui repositórios clonados/forks (padrão: false)
  --include-orgs          Inclui repositórios das organizações das quais participa (padrão: false)
  --no-cache              Ignora o cache local e busca dados atualizados
  --cache-ttl <minutes>   Tempo de vida do cache em minutos (padrão: "60")
  --fast                  Modo rápido: pula métricas mais lentas (atividade de commits/linhas)
  --concurrency <number>  Número de requisições paralelas simultâneas (padrão: "5")
  --user <username>       Usuário do GitHub a analisar (padrão: usuário autenticado)
  -h, --help              Exibe o guia de ajuda
```

---

<a name="-english"></a>
## 🇺🇸 English

# 📖 About
**github-statistics** (`github-stats`) is an interactive terminal CLI dashboard developed in Node.js and TypeScript powered by Ink (React for terminals). It queries both GitHub REST and GraphQL APIs to fetch and aggregate comprehensive statistics from any user profile or organization.

Features include:
- **Interactive Keyboard-Navigated Panels:** Overview, Languages (bytes & percentage breakdown), 12-Month Commit Activity (with terminal sparklines), Top Repositories sorted by stars, Issues & Pull Requests breakdown, Topics/Tags, and Releases.
- **Deep Metrics:** Total repositories, stars, forks, watchers, all-time commits, estimated lines of code, lines added and removed across commit history, and average repository size.
- **Fast & Parallelized:** High-speed data extraction using a configurable worker pool (`--concurrency`), coupled with local TTL-based caching to minimize API rate limit usage.

# 📋 Motivation
This project was born out of the need to extract comprehensive statistics from my GitHub profile after not finding existing tools or platforms that provided this detailed data directly in the terminal.

# 💻 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (`>= 18.0.0` recommended)
- [npm](https://www.npmjs.com/)
- [GitHub CLI (gh)](https://cli.github.com/) (optional, for streamlined authentication)

### Authentication
Authenticate either using GitHub CLI or an environment variable:
```sh
# Option A: via GitHub CLI (recommended)
gh auth login

# Option B: via Personal Access Token (PAT)
export GITHUB_TOKEN="ghp_your_token_here"
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

### CLI Command Options
```sh
github-stats [options]

Options:
  -V, --version           Output version number
  --scope <scope>         Repository scope: public, private, all (default: "all")
  --include-forks         Include forked repositories (default: false)
  --include-orgs          Include organization repositories (default: false)
  --no-cache              Bypass local cache and fetch fresh data
  --cache-ttl <minutes>   Cache time-to-live in minutes (default: "60")
  --fast                  Fast mode: skip slower historical commit/line metrics
  --concurrency <number>  Number of concurrent enrichment requests (default: "5")
  --user <username>       Target GitHub username (defaults to authenticated user)
  -h, --help              Display help guide
```

# 🤝 Contribuidores / Contributors
 <a href="https://github.com/bgluis/github-statistics/graphs/contributors">
   <img src="https://contrib.rocks/image?repo=bgluis/github-statistics"/>
 </a>
