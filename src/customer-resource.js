import Resource from './resource';
import defaultResolver from './default-resolver';
import handleCustomerMutation from './handle-customer-mutation';

// GraphQL
import customerAccessTokenCreateMutation from './graphql/customerAccessTokenCreateMutation.graphql';
//import customerAccessTokenDeleteMutation from './graphql/customerAccessTokenDeleteMutation.graphql';
import customerAccessTokenRenewMutation from './graphql/customerAccessTokenRenewMutation.graphql';
import customerCreateMutation from './graphql/customerCreateMutation.graphql';
import customerUpdateMutation from './graphql/customerUpdateMutation.graphql';
//import customerAddressCreateMutation from './graphql/customerAddressCreateMutation.graphql';
//import customerAddressUpdateMutation from './graphql/customerAddressUpdateMutation.graphql';
//import customerAddressDeleteMutation from './graphql/customerAddressDeleteMutation.graphql';
//import customerDefaultAddressUpdateMutation from './graphql/customerDefaultAddressUpdateMutation.graphql';
import customerRecoverMutation from './graphql/customerRecoverMutation.graphql';
import customerResetMutation from './graphql/customerResetMutation.graphql';
import customerActivateMutation from './graphql/customerActivateMutation.graphql';
import customerQuery from './graphql/customerQuery.graphql';

/**
 * The JS Buy SDK customer resource
 * @class
 */
class CustomerResource extends Resource {

  /**
   * Creates an access token for an existing user.
   *
   * @example
   * const input = {
   *   email: 'user@example.com',
   *   password: 'HiZqFuDvDdQ7'
   * };
   *
   * client.customer.createAccessToken(input).then((token) => {
   *   // Do something with the token
   * });
   *
   * @param {Object} [input] An input object containing:
   *   @param {String} [input.email] Customer's email address.
   *   @param {String} [input.password] Customer's log in password.
   * @return {Promise|GraphModel} A promise resolving with the customer access token.
   */
  createAccessToken(input = {}) {
    return this.graphQLClient
      .send(customerAccessTokenCreateMutation, {input})
      .then(handleCustomerMutation('customerAccessTokenCreate', this.graphQLClient));
  }

  /**
   * Deletes an existing access token for a user.
   *
   * @example
   * client.customer.deleteAccessToken('ae0f1d2e179c9571122a0595a6ac8125').then((response) => {
   *   const {deletedAccessToken, deletedCustomerAccessTokenId} = response;
   *   // Do something with the the deleted access token and corresponding ID
   * });
   *
   * @param {String} customerAccessToken The access token to delete.
   * @return {Promise|GraphModel} A promise resolving with an object containing the deleted access token and corresponding ID.
   */
  // deleteAccessToken(customerAccessToken) {
  //   return this.graphQLClient
  //     .send(customerAccessTokenDeleteMutation, {customerAccessToken})
  //     .then(handleCustomerMutation('customerAccessTokenDelete', this.graphQLClient));
  // }

  /**
   * Renews the access token for a user.
   *
   * @example
   * client.customer.renewAccessToken('ae0f1d2e179c9571122a0595a6ac8125').then((token) => {
   *   // Do something with the renewed token
   * });
   *
   * @param {String} customerAccessToken The access token to renew.
   * @return {Promise|GraphModel} A promise resolving with the renewed access token.
   */
  renewAccessToken(customerAccessToken) {
    return this.graphQLClient
      .send(customerAccessTokenRenewMutation, {customerAccessToken})
      .then(handleCustomerMutation('customerAccessTokenRenew', this.graphQLClient));
  }

  /**
   * Creates a new user.
   *
   * @example
   * const input = {
   *   email: 'user@example.com',
   *   password: 'HiZqFuDvDdQ7'
   * };
   *
   * client.customer.create(input).then((customer) => {
   *   // Do something with the new customer
   * });
   *
   * @param {Object} [input] An input object containing:
   *   @param {String} [input.email] Customer's email address.
   *   @param {String} [input.password] Customer's log in password.
   *   @param {String} [input.firstName] Customer's first name.
   *   @param {String} [input.lastName] Customer's last name.
   *   @param {String} [input.phone] Customer's phone number.
   *   @param {Boolean} [input.acceptsMarketing] Indicates whether the customer has consented to be sent marketing material via email.
   * @return {Promise|GraphModel} A promise resolving with the created customer.
   */
  create(input = {}) {
    return this.graphQLClient
      .send(customerCreateMutation, {input})
      .then(handleCustomerMutation('customerCreate', this.graphQLClient));
  }

  /**
   * Updates an existing customer.
   *
   * @example
   * const input = {
   *   customerAccessToken: 'ae0f1d2e179c9571122a0595a6ac8125',
   *   customer: {
   *     firstName: 'Fake'
   *   }
   * };
   *
   * client.customer.update(input).then((customer) => {
   *   // Do something with the updated customer
   * });
   *
   * @param {Object} [input] An input object containing:
   *   @param {String} [input.customerAccessToken] The access token to authenticate the customer.
   *   @param {Object} [input.customer] Customer's new information. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/customerupdateinput|Storefront API reference} for valid input fields.
   * @return {Promise|GraphModel} A promise resolving with the updated customer.
   */
  update({customerAccessToken, customer}) {
    return this.graphQLClient
      .send(customerUpdateMutation, {customerAccessToken, customer})
      .then(handleCustomerMutation('customerUpdate', this.graphQLClient));
  }

  /**
   * Creates a new address for a customer.
   *
   * @example
   * const input = {
   *   customerAccessToken: 'ae0f1d2e179c9571122a0595a6ac8125',
   *   address: {
   *     address1: '101 Fake Building',
   *     address2: '1 Fakeson St., Fake District',
   *     company: 'Fakeson Limited'
   *   }
   * };
   *
   * client.customer.createAddress(input).then((address) => {
   *   // Do something with the new customer address
   * });
   *
   * @param {Object} [input] An input object containing:
   *   @param {String} [input.customerAccessToken] The access token to authenticate the customer.
   *   @param {Object} [input.address] The new address. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/mailingaddressinput|Storefront API reference} for valid input fields.
   * @return {Promise|GraphModel} A promise resolving with the new customer address.
   */
  // createAddress({customerAccessToken, address}) {
  //   return this.graphQLClient
  //     .send(customerAddressCreateMutation, {customerAccessToken, address})
  //     .then(handleCustomerMutation('customerAddressCreate', this.graphQLClient));
  // }

  /**
   * Deletes an existing address for a customer.
   *
   * @example
   * const input = {
   *   customerAccessToken: 'ae0f1d2e179c9571122a0595a6ac8125',
   *   id: 'Z2lkOi8vU2hvcGlmeS9FeGFtcGxlLzE'
   * };
   *
   * client.customer.createAddress(input).then((deletedAddressId) => {
   *   // Do something with the ID of the deleted address
   * });
   *
   * @param {Object} [input] An input object containing:
   *   @param {String} [input.customerAccessToken] The access token to authenticate the customer.
   *   @param {String} [input.id] The address ID to specify the address to delete.
   * @return {Promise|GraphModel} A promise resolving with the deleted address ID.
   */
  // deleteAddress({customerAccessToken, id}) {
  //   return this.graphQLClient
  //     .send(customerAddressDeleteMutation, {customerAccessToken, id})
  //     .then(handleCustomerMutation('customerAddressDelete', this.graphQLClient));
  // }

  /**
   * Updates an address for a customer.
   *
   * @example
   * const input = {
   *   customerAccessToken: 'ae0f1d2e179c9571122a0595a6ac8125',
   *   id: 'Z2lkOi8vU2hvcGlmeS9FeGFtcGxlLzE',
   *   address: {}
   * };
   *
   * client.customer.updateAddress(input).then((address) => {
   *   // Do something with the updated address
   * });
   *
   * @param {Object} [input] An input object containing:
   *   @param {String} [input.customerAccessToken] The access token to authenticate the customer.
   *   @param {String} [input.id] The address ID to specify the address to update.
   *   @param {Object} [input.address] The updated address. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/mailingaddressinput|Storefront API reference} for valid input fields.
   * @return {Promise|GraphModel} A promise resolving with the updated address.
   */
  // updateAddress({customerAccessToken, id, address}) {
  //   return this.graphQLClient
  //     .send(customerAddressUpdateMutation, {customerAccessToken, id, address})
  //     .then(handleCustomerMutation('customerAddressUpdate', this.graphQLClient));
  // }

  /**
   * Updates the default address for a customer.
   *
   * @example
   * const input = {
   *   customerAccessToken: 'ae0f1d2e179c9571122a0595a6ac8125',
   *   addressId: 'Z2lkOi8vU2hvcGlmeS9FeGFtcGxlLzE'
   * };
   *
   * client.customer.updateDefaultAddress(input).then((customer) => {
   *   // Do something with the updated customer
   * });
   *
   * @param {Object} [input] An input object containing:
   *   @param {String} [input.customerAccessToken] The access token to authenticate the customer.
   *   @param {String} [input.addressId] The address ID to specify the address to set as default.
   * @return {Promise|GraphModel} A promise resolving with the updated customer.
   */
  // updateDefaultAddress({customerAccessToken, addressId}) {
  //   return this.graphQLClient
  //     .send(customerDefaultAddressUpdateMutation, {customerAccessToken, addressId})
  //     .then(handleCustomerMutation('customerDefaultAddressUpdate', this.graphQLClient));
  // }

  /**
   * Recovers a customer. Sends a reset password email to the customer, as the first step in the reset password process.
   *
   * @example
   * client.customer.recover('user@example.com').then(() => {
   *   // Do something after sending a reset password email
   * });
   *
   * @param {String} email The email address of the customer:
   * @return {Promise|GraphModel} A promise resolving with nothing.
   */
  recover(email) {
    return this.graphQLClient
      .send(customerRecoverMutation, {email})
      .then(handleCustomerMutation('customerRecover', this.graphQLClient));
  }

  /**
   * Resets a customer’s password with the reset token.
   *
   * @example
   * const input = {
   *   id: 'Z2lkOi8vU2hvcGlmeS9FeGFtcGxlLzE',
   *   input: {
   *     "resetToken": "ae0f1d2e179c9571122a0595a6ac8125",
   *     "password": "HiZqFuDvDdQ7"
   *   }
   * };
   *
   * client.customer.reset(input).then((customer) => {
   *   // Do something with the reset customer
   * });
   *
   * @param {Object} [input] An input object containing:
   *   @param {String} [input.id] The customer ID to specify the customer to reset.
   *   @param {Object} [input.input] The input object for resetting password. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/customerresetinput|Storefront API reference} for valid input fields.
   * @return {Promise|GraphModel} A promise resolving with the reset customer.
   */
  reset({id, input}) {
    return this.graphQLClient
      .send(customerResetMutation, {id, input})
      .then(handleCustomerMutation('customerReset', this.graphQLClient));
  }

  /**
   * Activates a customer.
   *
   * @example
   * const input = {
   *   id: 'Z2lkOi8vU2hvcGlmeS9FeGFtcGxlLzE',
   *   input: {
   *     "resetToken": "ae0f1d2e179c9571122a0595a6ac8125",
   *     "password": "HiZqFuDvDdQ7"
   *   }
   * };
   *
   * client.customer.activate(input).then((customer) => {
   *   // Do something with the activated customer
   * });
   *
   * @param {Object} [input] An input object containing:
   *   @param {String} [input.id] The customer ID to specify the customer to activate.
   *   @param {Object} [input.input] The input object for activating the customer. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/customeractivateinput|Storefront API reference} for valid input fields.
   * @return {Promise|GraphModel} A promise resolving with the reset customer.
   */
  activate({id, input}) {
    return this.graphQLClient
      .send(customerActivateMutation, {id, input})
      .then(handleCustomerMutation('customerActivate', this.graphQLClient));
  }

  /**
   * Fetches a customer by access token.
   *
   * @example
   * client.customer.fetch('ae0f1d2e179c9571122a0595a6ac8125').then((customer) => {
   *   // Do something with the customer
   * });
   *
   * @param {String} customerAccessToken The access token of the customer to fetch.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the customer.
   */
  fetch(customerAccessToken) {
    return this.graphQLClient
      .send(customerQuery, {customerAccessToken})
      .then(defaultResolver('customer'));
  }
}

export default CustomerResource;