import Resource from './resource';
import defaultResolver from './default-resolver';

// GraphQL
import customerCreateMutation from './graphql/customerCreateMutation.graphql';
import customerAccessTokenCreateMutation from './graphql/customerAccessTokenCreateMutation.graphql';

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
  }
  
}

export default CustomerResource;
