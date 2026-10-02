import { execFileSync } from 'child_process';

function readGhCliToken(): string {
  return execFileSync('gh', ['auth', 'token'], { stdio: ['pipe', 'pipe', 'pipe'] })
    .toString()
    .trim();
}

export function resolveToken(
  env: NodeJS.ProcessEnv = process.env,
  readGhToken: () => string = readGhCliToken
): string {
  if (env.GITHUB_TOKEN) return env.GITHUB_TOKEN;

  try {
    const token = readGhToken();
    if (token) return token;
  } catch {
    // gh not available or not logged in
  }

  throw new Error(
    '❌ No GitHub token found.\n' +
      'Please run `gh auth login` or set the GITHUB_TOKEN environment variable.'
  );
}
