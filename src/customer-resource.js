import Resource from './resource';
import defaultResolver from './default-resolver';
import handleCustomerMutation from './handle-customer-mutation';

// GraphQL
import customerAccessTokenCreateMutation from './graphql/customerAccessTokenCreateMutation.graphql';
import customerAccessTokenDeleteMutation from './graphql/customerAccessTokenDeleteMutation.graphql';
import customerAccessTokenRenewMutation from './graphql/customerAccessTokenRenewMutation.graphql';
import customerCreateMutation from './graphql/customerCreateMutation.graphql';
import customerAddressCreateMutation from './graphql/customerAddressCreateMutation.graphql';

/**
 * The JS Buy SDK customer resource
 * @class
 */
class CustomerResource extends Resource {

  createAccessToken(input = {}) {
    return this.graphQLClient
      .send(customerAccessTokenCreateMutation, {input})
      .then(handleCustomerMutation('customerAccessTokenCreate', this.graphQLClient));
  }

  deleteAccessToken(customerAccessToken) {
    return this.graphQLClient
      .send(customerAccessTokenDeleteMutation, {customerAccessToken})
      .then(handleCustomerMutation('customerAccessTokenDelete', this.graphQLClient));
  }

  renewAccessToken(customerAccessToken) {
    return this.graphQLClient
      .send(customerAccessTokenRenewMutation, {customerAccessToken})
      .then(handleCustomerMutation('customerAccessTokenRenew', this.graphQLClient));
  }

  create(input = {}) {
    return this.graphQLClient
      .send(customerCreateMutation, {input})
      .then(handleCustomerMutation('customerCreate', this.graphQLClient));
  }

  createAddress({customerAccessToken, address}) {
    return this.graphQLClient
      .send(customerAddressCreateMutation, {customerAccessToken, address})
      .then(handleCustomerMutation('customerAddressCreate', this.graphQLClient));
  }
}

export default CustomerResource;
