import { execSync } from 'child_process';

export function resolveToken(): string {
  // 1. Try gh CLI
  try {
    const token = execSync('gh auth token', {
      stdio: ['pipe', 'pipe', 'pipe'],
    })
      .toString()
      .trim();
    if (token) {
      return token;
    }
  } catch {
    // gh not available or not logged in
  }

  // 2. Fallback to env var
  const env = process.env.GITHUB_TOKEN;
  if (env) return env;

  throw new Error(
    '❌ No GitHub token found.\n' +
      'Please run `gh auth login` or set the GITHUB_TOKEN environment variable.'
  );
}
