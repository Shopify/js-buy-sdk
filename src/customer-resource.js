import Resource from './resource';
import defaultResolver from './default-resolver';
import handleCustomerMutation from './handle-customer-mutation';

// GraphQL
import customerAccessTokenCreateMutation from './graphql/customerAccessTokenCreateMutation.graphql';
import customerAccessTokenDeleteMutation from './graphql/customerAccessTokenDeleteMutation.graphql';
import customerAccessTokenRenewMutation from './graphql/customerAccessTokenRenewMutation.graphql';
import customerCreateMutation from './graphql/customerCreateMutation.graphql';
import customerAddressCreateMutation from './graphql/customerAddressCreateMutation.graphql';
import customerAddressUpdateMutation from './graphql/customerAddressUpdateMutation.graphql';
import customerAddressDeleteMutation from './graphql/customerAddressDeleteMutation.graphql';
import customerDefaultAddressUpdateMutation from './graphql/customerDefaultAddressUpdateMutation.graphql';
import customerQuery from './graphql/customerQuery.graphql';

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

  deleteAddress({customerAccessToken, id}) {
    return this.graphQLClient
      .send(customerAddressDeleteMutation, {customerAccessToken, id})
      .then(handleCustomerMutation('customerAddressDelete', this.graphQLClient));
  }

  updateAddress({customerAccessToken, id, address}) {
    return this.graphQLClient
      .send(customerAddressUpdateMutation, {customerAccessToken, id, address})
      .then(handleCustomerMutation('customerAddressUpdate', this.graphQLClient));
  }

  updateDefaultAddress({customerAccessToken, addressId}) {
    return this.graphQLClient
      .send(customerDefaultAddressUpdateMutation, {customerAccessToken, addressId})
      .then(handleCustomerMutation('customerDefaultAddressUpdate', this.graphQLClient));
  }

  fetch(customerAccessToken) {
    return this.graphQLClient
      .send(customerQuery, {customerAccessToken})
      .then(defaultResolver('customer'));
  }
}

export default CustomerResource;
