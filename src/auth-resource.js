import Resource from './resource';
import defaultResolver from './default-resolver';
import handleAuthMutation from './handle-auth-mutation';

// GraphQL
import authMutation from './graphql/authMutation.graphql';

/**
 * The JS Buy SDK customer resource
 * @class
 */
class AuthResource extends Resource {

  create(input = {}) {
    return this.graphQLClient
      .send(authMutation, {input})
      .then(handleAuthMutation('customerAccessTokenCreate', this.graphQLClient));
  }
}

export default AuthResource;
