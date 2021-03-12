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
      .then(defaultResolver('customerCreate'));
  }

  update(customerAccessToken, customer) {
    return this.graphQLClient
      .send(customerUpdateMutation, {customerAccessToken, customer})
      .then(defaultResolver('customerUpdate'));
  }

  createAccessToken(input) {
    return this.graphQLClient
      .send(customerAccessTokenCreateMutation, {input})
      .then(defaultResolver('customerAccessTokenCreate'));
  }

  deleteAccessToken(customerAccessToken) {
    return this.graphQLClient
      .send(customerAccessTokenDeleteMutation, {customerAccessToken})
      .then(defaultResolver('customerAccessTokenDelete'));
    
  }
  
  renewAccessToken(customerAccessToken) {
    return this.graphQLClient
      .send(customerAccessTokenRenewMutation, {customerAccessToken})
      .then(defaultResolver('customerAccessTokenRenew'));
  }

  createAccessTokenWithMultipass(multipassToken) {
    return this.graphQLClient
      .send(customerAccessTokenCreateWithMultipassMutation, {multipassToken})
      .then(defaultResolver('customerAccessTokenCreateWithMultipass'));
  }
  
  activate(id, input) {
    return this.graphQLClient
      .send(customerActivateMutation, {id, input})
      .then(defaultResolver('customerActivate'));
  }

  activateByUrl(activationUrl, password) {
    return this.graphQLClient
      .send(customerActivateByUrlMutation, {activationUrl, password})
      .then(defaultResolver('customerActivateByUrl'));
  }

  createAddress(customerAccessToken, address) {
    return this.graphQLClient
      .send(customerAddressCreateMutation, {customerAccessToken, address})
      .then(defaultResolver('customerAddressCreate'));
  }

  deleteAddress(id, customerAccessToken) {
    return this.graphQLClient
      .send(customerAddressDeleteMutation, {id, customerAccessToken})
      .then(defaultResolver('customerAddressDelete'));
  }

  updateAddress(customerAccessToken, id, address) {
    return this.graphQLClient
      .send(customerAddressUpdateMutation, {customerAccessToken, id, address})
      .then(defaultResolver('customerAddressUpdate'));
  }

  updateDefaultAddress(customerAccessToken, addressId) {
    return this.graphQLClient
      .send(customerDefaultAddressUpdateMutation, {customerAccessToken, addressId})
      .then(defaultResolver('customerDefaultAddressUpdate'));
  }

  recover(email) {
    return this.graphQLClient
      .send(customerRecoverMutation, {email})
      .then(defaultResolver('customerRecover'));
  }

  reset(id, input) {
    return this.graphQLClient
      .send(customerResetMutation, {id, input})
      .then(defaultResolver('customerReset'));
  }

  resetByUrl(resetUrl, password) {
    return this.graphQLClient
      .send(customerResetByUrlMutation, {resetUrl, password})
      .then(defaultResolver('customerResetByUrl'));
  }

}

export default CustomerResource;
