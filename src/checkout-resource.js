import Resource from './resource';
import defaultResolver from './default-resolver';
import handleCheckoutMutation from './handle-checkout-mutation';

// GraphQL
import checkoutNodeQuery from './graphql/checkoutNodeQuery.graphql';
import checkoutCreateMutation from './graphql/checkoutCreateMutation.graphql';
import checkoutLineItemsAddMutation from './graphql/checkoutLineItemsAddMutation.graphql';
import checkoutLineItemsRemoveMutation from './graphql/checkoutLineItemsRemoveMutation.graphql';
import checkoutLineItemsReplaceMutation from './graphql/checkoutLineItemsReplaceMutation.graphql';
import checkoutLineItemsUpdateMutation from './graphql/checkoutLineItemsUpdateMutation.graphql';
import checkoutAttributesUpdateV2Mutation from './graphql/checkoutAttributesUpdateV2Mutation.graphql';
import checkoutDiscountCodeApplyV2Mutation from './graphql/checkoutDiscountCodeApplyV2Mutation.graphql';
import checkoutDiscountCodeRemoveMutation from './graphql/checkoutDiscountCodeRemoveMutation.graphql';
import checkoutEmailUpdateV2Mutation from './graphql/checkoutEmailUpdateV2Mutation.graphql';

/**
 * The JS Buy SDK checkout resource
 * @class
 */
class CheckoutResource extends Resource {

  /**
   * Fetches a checkout by ID.
   *
   * @example
   * client.checkout.fetch('FlZj9rZXlN5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=').then((checkout) => {
   *   // Do something with the checkout
   * });
   *
   * @param {String} id The id of the checkout to fetch.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the checkout.
   */
  fetch(id) {
    return this.graphQLClient
      .send(checkoutNodeQuery, {id})
      .then(defaultResolver('node'))
      .then((checkout) => {
        if (!checkout) { return null; }

        return this.graphQLClient.fetchAllPages(checkout.lineItems, {pageSize: 250}).then((lineItems) => {
          checkout.attrs.lineItems = lineItems;

          return checkout;
        });
      });
  }

  /**
   * Creates a checkout.
   *
   * @example
   * const input = {
   *   lineItems: [
   *     {variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}
   *   ]
   * };
   *
   * client.checkout.create(input).then((checkout) => {
   *   // Do something with the newly created checkout
   * });
   *
   * @param {Object} [input] An input object containing zero or more of:
   *   @param {String} [input.email] An email connected to the checkout.
   *   @param {Object[]} [input.lineItems] A list of line items in the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
   *   @param {Object} [input.shippingAddress] A shipping address. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/mailingaddressinput|Storefront API reference} for valid input fields.
   *   @param {String} [input.note] A note for the checkout.
   *   @param {Object[]} [input.customAttributes] A list of custom attributes for the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/attributeinput|Storefront API reference} for valid input fields.
   * @return {Promise|GraphModel} A promise resolving with the created checkout.
   */
  create(input = {}) {
    return this.graphQLClient
      .send(checkoutCreateMutation, {input})
      .then(handleCheckoutMutation('checkoutCreate', this.graphQLClient));
  }

  /**
   * Replaces the value of checkout's custom attributes and/or note with values defined in the input
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const input = {customAttributes: [{key: "MyKey", value: "MyValue"}]};
   *
   * client.checkout.updateAttributes(checkoutId, input).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to update.
   * @param {Object} [input] An input object containing zero or more of:
   *   @param {Boolean} [input.allowPartialAddresses] An email connected to the checkout.
   *   @param {Object[]} [input.customAttributes] A list of custom attributes for the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/attributeinput|Storefront API reference} for valid input fields.
   *   @param {String} [input.note] A note for the checkout.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  updateAttributes(checkoutId, input = {}) {
    return this.graphQLClient
      .send(checkoutAttributesUpdateV2Mutation, {checkoutId, input})
      .then(handleCheckoutMutation('checkoutAttributesUpdateV2', this.graphQLClient));
  }

  /**
   * Replaces the value of checkout's email address
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const email = 'user@example.com';
   *
   * client.checkout.updateEmail(checkoutId, email).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to update.
   * @param {String} email The email address to apply to the checkout.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  updateEmail(checkoutId, email) {
    return this.graphQLClient
      .send(checkoutEmailUpdateV2Mutation, {checkoutId, email})
      .then(handleCheckoutMutation('checkoutEmailUpdateV2', this.graphQLClient));
  }

  /**
   * Adds line items to an existing checkout.
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const lineItems = [{variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}];
   *
   * client.checkout.addLineItems(checkoutId, lineItems).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to add line items to.
   * @param {Object[]} lineItems A list of line items to add to the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  addLineItems(checkoutId, lineItems) {
    return this.graphQLClient
      .send(checkoutLineItemsAddMutation, {checkoutId, lineItems})
      .then(handleCheckoutMutation('checkoutLineItemsAdd', this.graphQLClient));
  }

  /**
   * Applies a discount to an existing checkout using a discount code.
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const discountCode = 'best-discount-ever';
   *
   * client.checkout.addDiscount(checkoutId, discountCode).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to add discount to.
   * @param {String} discountCode The discount code to apply to the checkout.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  addDiscount(checkoutId, discountCode) {
    return this.graphQLClient
      .send(checkoutDiscountCodeApplyV2Mutation, {checkoutId, discountCode})
      .then(handleCheckoutMutation('checkoutDiscountCodeApplyV2', this.graphQLClient));
  }

  /**
   * Removes the applied discount from an existing checkout.
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   *
   * client.checkout.removeDiscount(checkoutId).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to remove the discount from.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  removeDiscount(checkoutId) {
    return this.graphQLClient
      .send(checkoutDiscountCodeRemoveMutation, {checkoutId})
      .then(handleCheckoutMutation('checkoutDiscountCodeRemove', this.graphQLClient));
  }

  /**
   * Removes line items from an existing checkout.
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const lineItemIds = ['TViZGE5Y2U1ZDFhY2FiMmM2YT9rZXk9NTc2YjBhODcwNWIxYzg0YjE5ZjRmZGQ5NjczNGVkZGU='];
   *
   * client.checkout.removeLineItems(checkoutId, lineItemIds).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to remove line items from.
   * @param {String[]} lineItemIds A list of the ids of line items to remove from the checkout.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  removeLineItems(checkoutId, lineItemIds) {
    return this.graphQLClient
      .send(checkoutLineItemsRemoveMutation, {checkoutId, lineItemIds})
      .then(handleCheckoutMutation('checkoutLineItemsRemove', this.graphQLClient));
  }

  /**
   * Replace line items on an existing checkout.
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const lineItems = [{variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}];
   *
   * client.checkout.replaceLineItems(checkoutId, lineItems).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to add line items to.
   * @param {Object[]} lineItems A list of line items to set on the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  replaceLineItems(checkoutId, lineItems) {
    return this.graphQLClient
      .send(checkoutLineItemsReplaceMutation, {checkoutId, lineItems})
      .then(handleCheckoutMutation('checkoutLineItemsReplace', this.graphQLClient));
  }

  /**
   * Updates line items on an existing checkout.
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const lineItems = [
   *   {
   *     id: 'TViZGE5Y2U1ZDFhY2FiMmM2YT9rZXk9NTc2YjBhODcwNWIxYzg0YjE5ZjRmZGQ5NjczNGVkZGU=',
   *     quantity: 5,
   *     variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg=='
   *   }
   * ];
   *
   * client.checkout.updateLineItems(checkoutId, lineItems).then(checkout => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to update a line item on.
   * @param {Object[]} lineItems A list of line item information to update. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineitemupdateinput|Storefront API reference} for valid input fields for each line item.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  updateLineItems(checkoutId, lineItems) {
    return this.graphQLClient
      .send(checkoutLineItemsUpdateMutation, {checkoutId, lineItems})
      .then(handleCheckoutMutation('checkoutLineItemsUpdate', this.graphQLClient));
  }
}

export default CheckoutResource;
