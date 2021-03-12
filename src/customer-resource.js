import Resource from './resource';
import defaultResolver from './default-resolver';

// GraphQL
import customerCreateMutation from './graphql/customerCreateMutation.graphql';

import customerAccessTokenCreateMutation from './graphql/customerAccessTokenCreateMutation.graphql';
import customerAccessTokenCreateWithMultipassMutation from './graphql/customerAccessTokenCreateWithMultipassMutation.graphql';
import customerAccessTokenDeleteMutation from './graphql/customerAccessTokenDeleteMutation.graphql';
import customerAccessTokenRenewMutation from './graphql/customerAccessTokenRenewMutation.graphql';

import customerActivateByUrlMutation from './graphql/customerActivateByUrlMutation.graphql';
import customerActivateMutation from './graphql/customerActivateMutation.graphql';

import customerAddressCreateMutation from './graphql/customerAddressCreateMutation.graphql';
import customerAddressDeleteMutation from './graphql/customerAddressDeleteMutation.graphql';
import customerAddressUpdateMutation from './graphql/customerAddressUpdateMutation.graphql';

import customerDefaultAddressUpdateMutation from './graphql/customerDefaultAddressUpdateMutation.graphql';
import customerRecoverMutation from './graphql/customerRecoverMutation.graphql';
import customerResetByUrlMutation from './graphql/customerResetByUrlMutation.graphql';
import customerResetMutation from './graphql/customerResetMutation.graphql';

import customerUpdateMutation from './graphql/customerUpdateMutation.graphql';

/**
 * The JS Buy SDK customer resource
 * @class
 */
class CustomerResource extends Resource {

  /**
   * Creates a customer.
   *
   * @example
   * const input = {
   *   email: "isamu@to-kyo.to",
   *   password: "HiZqFuDvDdQ7"
   * };
   *
   * client.customer.create(input).then((customer) => {
   *   // Do something with the newly created customer
   * });
   *
   * @param {Object} [input] An input object containing of:
   *   @param {String} [input.email] The customer’s email
   *   @param {String} [input.password] The login password used by the customer.
   * @return {Promise|GraphModel} A promise resolving with the created customer.
   */
  create(input) {
    return this.graphQLClient
      .send(customerCreateMutation, {input})
      .then(defaultResolver('customerCreate.customer'));
  }

  createAccessToken(input) {
    return this.graphQLClient
      .send(customerAccessTokenCreateMutation, {input})
      .then(defaultResolver('customerAccessTokenCreate.customerAccessToken'));
  }

  // not implemented
  createAccessTokenWithMultipass(multipassToken) {
    return this.graphQLClient
      .send(customerAccessTokenCreateWithMultipassMutation, {multipassToken});
  }
  
  deleteAccessToken(customerAccessToken) {
    return this.graphQLClient
      .send(customerAccessTokenDeleteMutation, {customerAccessToken});
  }
  
  renewAccessToken(customerAccessToken) {
    return this.graphQLClient
      .send(customerAccessTokenRenewMutation, {customerAccessToken});
  }

  activate(id, input) {
    return this.graphQLClient
      .send(customerActivateMutation, {id, input})
  }

  activateByUrl(activationUrl, password) {
    return this.graphQLClient
      .send(customerActivateByUrlMutation, {activationUrl, password});
  }

  createAddress(customerAccessToken, address) {
    return this.graphQLClient
      .send(customerAddressCreateMutation, {customerAccessToken, address});
  }

  deleteAddress(id, customerAccessToken) {
    return this.graphQLClient
      .send(customerAddressDeleteMutation, {id, customerAccessToken});
  }

  updateAddress(customerAccessToken, id, address) {
    return this.graphQLClient
      .send(customerAddressUpdateMutation, {customerAccessToken, id, address});
  }

  updateDefaultAddress(customerAccessToken, addressId) {
    return this.graphQLClient
      .send(customerDefaultAddressUpdateMutation, {customerAccessToken, addressId});
  }

  recover(email) {
    return this.graphQLClient
      .send(customerRecoverMutation, {email});
  }

  reset(id, input) {
    return this.graphQLClient
      .send(customerResetMutation, {id, input});
  }

  resetByUrl(resetUrl, password) {
    return this.graphQLClient
      .send(customerResetByUrlMutation, {resetUrl, password});
  }

  update(customerAccessToken, customer) {
    return this.graphQLClient
      .send(customerUpdateMutation, {customerAccessToken, customer});
  }
}

export default CustomerResource;
