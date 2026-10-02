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
  <a href="README.md">🇺🇸 English</a> • 🇧🇷 Português
</div>

---

## 📖 Sobre
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

## 📋 Motivo
O projeto nasceu porque queria extrair estatísticas do meu perfil do GitHub e não achei locais ou ferramentas disponíveis que fizessem isso de forma completa, detalhada e direto no terminal.

## 💻 Como iniciar

### Requisitos
- [Node.js](https://nodejs.org/) (versão `>= 20`)
- [npm](https://www.npmjs.com/)
- [GitHub CLI (gh)](https://cli.github.com/) (opcional, para autenticação automática simplificada)
- Um terminal interativo (TTY) com pelo menos 24 linhas: a CLI encerra com erro se a saída for redirecionada ou executada em pipe, e o dashboard pede para aumentar o terminal se ele for mais baixo. O dashboard usa a tela alternativa do terminal (como `vim`/`htop`), então não deixa resíduos no histórico, inclusive via SSH, e acompanha redimensionamentos

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

## 🤝 Contribuidores
 <a href="https://github.com/bgluis/github-statistics/graphs/contributors">
   <img src="https://contrib.rocks/image?repo=bgluis/github-statistics"/>
 </a>
