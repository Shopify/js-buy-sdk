import Resource from './resource';
import defaultResolver from './default-resolver';
import handleCartMutation from './handle-cart-mutation';

// GraphQL
import cartNodeQuery from './graphql/cartNodeQuery.graphql';
import cartCreateMutation from './graphql/cartCreateMutation.graphql';
import cartAttributesUpdateMutation from './graphql/cartAttributesUpdateMutation.graphql';
import cartBuyerIdentityUpdateMutation from './graphql/cartBuyerIdentityUpdateMutation.graphql';
import cartDiscountCodesUpdateMutation from './graphql/cartDiscountCodesUpdateMutation.graphql';
import cartLinesAddMutation from './graphql/cartLinesAddMutation.graphql';
import cartLinesRemoveMutation from './graphql/cartLinesRemoveMutation.graphql';
import cartLinesUpdateMutation from './graphql/cartLinesUpdateMutation.graphql';
import cartNoteUpdateMutation from './graphql/cartNoteUpdateMutation.graphql';
import cartSelectedDeliveryOptionsUpdateMutation from './graphql/cartSelectedDeliveryOptionsUpdateMutation.graphql';

/**
 * The JS Buy SDK cart resource
 * @class
 */
class CartResource extends Resource {

  /**
   * Fetches a card by ID.
   *
   * @example
   * client.cart.fetch('FlZj9rZXlN5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=').then((cart) => {
   *   // Do something with the cart
   * });
   *
   * @param {String} id The id of the card to fetch.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the cart.
   */
  fetch(id) {
    return this.graphQLClient
      .send(cartNodeQuery, {id})
      .then(defaultResolver('node'))
      .then((cart) => {
        if (!cart) { return null; }

        return this.graphQLClient.fetchAllPages(cart.lines, {pageSize: 250}).then((lineItems) => {
          cart.attrs.lineItems = lineItems;

          return cart;
        });
      });
  }

  /**
   * Creates a cart.
   *
   * @example
   * const input = {
   *   lines: [
   *     {merchandiseId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}
   *   ]
   * };
   *
   * client.cart.create(input).then((cart) => {
   *   // Do something with the newly created cart
   * });
   *
   * @param {Object} [input] An input object containing zero or more of:
   *   @param {Object[]} [input.attributes] A list of attributes for the cart. See the {@link https://shopify.dev/docs/api/storefront/latest/input-objects/AttributeInput|Storefront API reference} for valid input fields.
   *   @param {Object} [input.buyerIdentity] The customer associated with the cart. See the {@link https://shopify.dev/docs/api/storefront/latest/input-objects/CartBuyerIdentityInput|Storefront API reference} for valid input fields.
   *   @param {String[]} [input.discountCodes] The discount codes for the cart.
   *   @param {Object[]} [input.lines] A list of line items in the cart. See the {@link https://shopify.dev/docs/api/storefront/latest/input-objects/CartLineInput|Storefront API reference} for valid input fields for each line item.
   *   @param {Object[]} [input.metafields] The metafields for this cart.  See the {@link https://shopify.dev/docs/api/storefront/latest/input-objects/CartInputMetafieldInput|Storefront API reference} for valid input fields for each line item.
   *   @param {String} [input.note] A note for the cart.
   * @return {Promise|GraphModel} A promise resolving with the created cart.
   */
  create(input = {}) {
    return this.graphQLClient
      .send(cartCreateMutation, {input})
      .then(handleCartMutation('cartCreate', this.graphQLClient));
  }

  /**
   * Replaces the value of a cart's custom attributes
   *
   * @example
   * const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
   * const attributes = [{key: "MyKey", value: "MyValue"}];
   *
   * client.cart.updateAttributes(cartId, attributes).then((cart) => {
   *   // Do something with the updated cart
   * });
   *
   * @param {String} cartId The ID of the cart to update.
   * @param {Object[]} [attributes] A list of additional information about the cart. See the {@link https://shopify.dev/docs/api/storefront/unstable/input-objects/AttributeInput|Storefront API reference} for valid input fields.
   * @return {Promise|GraphModel} A promise resolving with the updated cart.
   */
  updateAttributes(cartId, attributes = []) {
    return this.graphQLClient
      .send(cartAttributesUpdateMutation, {cartId, attributes})
      .then(handleCartMutation('cartAttributesUpdate', this.graphQLClient));
  }

  /**
   * Replaces the value of a cart's buyer identity
   *
   * @example
   * const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
   * const buyerIdentity = {email: "hello@hi.com"};
   *
   * client.cart.updateBuyerIdentity(cartId, buyerIdentity).then((cart) => {
   *  // Do something with the updated cart
   * });
   *
   * @param {String} cartId The ID of the cart to update.
   * @param {Object} [buyerIdentity] A list of additional information about the cart. See the {@link https://shopify.dev/docs/api/storefront/unstable/input-objects/AttributeInput|Storefront API reference} for valid input fields.
   * @return {Promise|GraphModel} A promise resolving with the updated cart.
   * */
  updateBuyerIdentity(cartId, buyerIdentity = {}) {
    return this.graphQLClient
      .send(cartBuyerIdentityUpdateMutation, {cartId, buyerIdentity})
      .then(handleCartMutation('cartBuyerIdentityUpdate', this.graphQLClient));
  }

  /**
   * Replaces the value of a cart's discount codes
   *
   * @example
   * const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
   * const discountCodes = [{code: "MyCode"}];
   *
   * client.cart.updateDiscountCodes(cartId, discountCodes).then((cart) => {
   * // Do something with the updated cart
   * });
   *
   * @param {String} cartId The ID of the cart to update.
   * @param {Object[]} [discountCodes] A list of additional information about the cart. See the {@link https://shopify.dev/docs/api/storefront/unstable/input-objects/AttributeInput|Storefront API reference} for valid input fields.
   * @return {Promise|GraphModel} A promise resolving with the updated cart.
   * */
  updateDiscountCodes(cartId, discountCodes = []) {
    return this.graphQLClient
      .send(cartDiscountCodesUpdateMutation, {cartId, discountCodes})
      .then(handleCartMutation('cartDiscountCodesUpdate', this.graphQLClient));
  }

  /**
   * Adds line items to a cart
   *
   * @example
   * const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
   * const lines = [{merchandiseId: 'gid://shopify/Product/123456', quantity: 5}];
   *
   * client.cart.addLineItems(cartId, lines).then((cart) => {
   * // Do something with the updated cart
   * });
   *
   * @param {String} cartId The ID of the cart to update.
   * @param {Object[]} [lines] A list of merchandise lines to add to the cart.
   * @return {Promise|GraphModel} A promise resolving with the updated cart.
   * */
  addLineItems(cartId, lines = []) {
    return this.graphQLClient
      .send(cartLinesAddMutation, {cartId, lines})
      .then(handleCartMutation('cartLinesAdd', this.graphQLClient));
  }

  /**
   * Removes line items from a cart
   *
   * @example
   * const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
   * const lineIds = ['gid://shopify/CartLineItem/123456'];
   *
   * client.cart.removeLineItems(cartId, lineIds).then((cart) => {
   * // Do something with the updated cart
   * });
   *
   * @param {String} cartId The ID of the cart to update.
   * @param {String[]} [lineIds] A list of merchandise lines to remove from the cart.
   * @return {Promise|GraphModel} A promise resolving with the updated cart.
   *
   */
  removeLineItems(cartId, lineIds = []) {
    return this.graphQLClient
      .send(cartLinesRemoveMutation, {cartId, lineIds})
      .then(handleCartMutation('cartLinesRemove', this.graphQLClient));
  }

  /**
   * Updates line items in a cart
   *
   * @example
   * const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
   * const lines = [{id: 'gid://shopify/CartLineItem/123456', quantity: 5}];
   *
   * client.cart.updateLineItems(cartId, lines).then((cart) => {
   * // Do something with the updated cart
   * });
   *
   * @param {String} cartId The ID of the cart to update.
   * @param {Object[]} [lines] A list of merchandise lines to update in the cart.
   * @return {Promise|GraphModel} A promise resolving with the updated cart.
   * */
  updateLineItems(cartId, lines = []) {
    return this.graphQLClient
      .send(cartLinesUpdateMutation, {cartId, lines})
      .then(handleCartMutation('cartLinesUpdate', this.graphQLClient));
  }

  /**
   * Updates the note on a cart
   *
   * @example
   * const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
   * const note = 'A note for the cart';
   *
   * client.cart.updateNote(cartId, note).then((cart) => {
   * // Do something with the updated cart
   * }
   *
   * @param {String} cartId The ID of the cart to update.
   * @param {String} [note] A note for the cart.
   * @return {Promise|GraphModel} A promise resolving with the updated cart.
   * */
  updateNote(cartId, note) {
    return this.graphQLClient
      .send(cartNoteUpdateMutation, {cartId, note})
      .then(handleCartMutation('cartNoteUpdate', this.graphQLClient));
  }

  /**
   * Updates the selected delivery options on a cart
   *
   * @example
   * const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
   * const selectedDeliveryOptions = [{deliveryGroupId: 'gid://shopify/CartDeliveryGroup/269ea2856c41d63937d1ba5212c29713', deliveryOptionHandle: 'standard'}];
   *
   * client.cart.updateSelectedDeliveryOptions(cartId, selectedDeliveryOptions).then((cart) => {
   * // Do something with the updated cart
   * });
   *
   * @param {String} cartId The ID of the cart to update.
   * @param {Object[]} [selectedDeliveryOptions] The selected delivery options.
   * @return {Promise|GraphModel} A promise resolving with the updated cart.
   * */
  updateSelectedDeliveryOptions(cartId, selectedDeliveryOptions = []) {
    return this.graphQLClient
      .send(cartSelectedDeliveryOptionsUpdateMutation, {cartId, selectedDeliveryOptions})
      .then(handleCartMutation('cartSelectedDeliveryOptionsUpdate', this.graphQLClient));
  }
}

export default CartResource;
