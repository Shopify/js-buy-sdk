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

  /**
   * Update a customer.
   *
   */
  update(customerAccessToken, customer) {
    return this.graphQLClient
      .send(customerUpdateMutation, {customerAccessToken, customer})
      .then(defaultResolver('customerUpdate'));
  }

  /**
   * Create a access token.
   *
   */
  createAccessToken(input) {
    return this.graphQLClient
      .send(customerAccessTokenCreateMutation, {input})
      .then(defaultResolver('customerAccessTokenCreate'));
  }

  /**
   * Delete a access token.
   *
   */
  deleteAccessToken(customerAccessToken) {
    return this.graphQLClient
      .send(customerAccessTokenDeleteMutation, {customerAccessToken})
      .then(defaultResolver('customerAccessTokenDelete'));
  }

  /**
   * Renew a access token.
   *
   */
  renewAccessToken(customerAccessToken) {
    return this.graphQLClient
      .send(customerAccessTokenRenewMutation, {customerAccessToken})
      .then(defaultResolver('customerAccessTokenRenew'));
  }

  /**
   * Create a access token with Multipass.
   *
   */
  createAccessTokenWithMultipass(multipassToken) {
    return this.graphQLClient
      .send(customerAccessTokenCreateWithMultipassMutation, {multipassToken})
      .then(defaultResolver('customerAccessTokenCreateWithMultipass'));
  }

  /**
   * Activate customer account.
   *
   */
  activate(id, input) {
    return this.graphQLClient
      .send(customerActivateMutation, {id, input})
      .then(defaultResolver('customerActivate'));
  }

  /**
   * Activate customer account by URL.
   *
   */
  activateByUrl(activationUrl, password) {
    return this.graphQLClient
      .send(customerActivateByUrlMutation, {activationUrl, password})
      .then(defaultResolver('customerActivateByUrl'));
  }

  /**
   * Create customer's address.
   *
   */
  createAddress(customerAccessToken, address) {
    return this.graphQLClient
      .send(customerAddressCreateMutation, {customerAccessToken, address})
      .then(defaultResolver('customerAddressCreate'));
  }

  /**
   * Delete customer's address.
   *
   */
  deleteAddress(id, customerAccessToken) {
    return this.graphQLClient
      .send(customerAddressDeleteMutation, {id, customerAccessToken})
      .then(defaultResolver('customerAddressDelete'));
  }

  /**
   * Update customer's address.
   *
   */
  updateAddress(customerAccessToken, id, address) {
    return this.graphQLClient
      .send(customerAddressUpdateMutation, {customerAccessToken, id, address})
      .then(defaultResolver('customerAddressUpdate'));
  }

  /**
   * Update customer's default address.
   *
   */
  updateDefaultAddress(customerAccessToken, addressId) {
    return this.graphQLClient
      .send(customerDefaultAddressUpdateMutation, {customerAccessToken, addressId})
      .then(defaultResolver('customerDefaultAddressUpdate'));
  }

  /**
   * Recover customer.
   *
   */
  recover(email) {
    return this.graphQLClient
      .send(customerRecoverMutation, {email})
      .then(defaultResolver('customerRecover'));
  }

  /**
   * Reset customer password.
   *
   */
  reset(id, input) {
    return this.graphQLClient
      .send(customerResetMutation, {id, input})
      .then(defaultResolver('customerReset'));
  }

  /**
   * Reset customer password by Url.
   *
   */
  resetByUrl(resetUrl, password) {
    return this.graphQLClient
      .send(customerResetByUrlMutation, {resetUrl, password})
      .then(defaultResolver('customerResetByUrl'));
  }

}

export default CustomerResource;
