import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';

let restClient: Octokit | null = null;
let graphqlClient: typeof graphql | null = null;

export function getRestClient(token: string): Octokit {
  if (!restClient) {
    restClient = new Octokit({ auth: token });
  }
  return restClient;
}

export function getGraphQLClient(token: string) {
  if (!graphqlClient) {
    graphqlClient = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }
  return graphqlClient;
}
