import Resource from './resource';
import defaultResolver from './default-resolver';
import handleCartMutation from './handle-cart-mutation';

// GraphQL
import cartNodeQuery from './graphql/cartNodeQuery.graphql';
import cartCreateMutation from './graphql/cartCreateMutation.graphql';
import cartAttributesUpdateMutation from './graphql/cartAttributesUpdateMutation.graphql';
import cartBuyerIdentityUpdateMutation from './graphql/cartBuyerIdentityUpdateMutation.graphql';
import cartDiscountCodesUpdateMutation from './graphql/cartDiscountCodesUpdateMutation.graphql';
import cartGiftCardCodesUpdateMutation from './graphql/cartGiftCardCodesUpdateMutation.graphql';
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
      .then(defaultResolver('cart'))
      .then(this.payloadMapper.fetch);
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
   *   @param {Object[]} [input.lineItems] A list of line items in the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
   *   @param {Object} [input.shippingAddress] A shipping address. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/mailingaddressinput|Storefront API reference} for valid input fields.
   *   @param {String} [input.note] A note for the checkout.
   *   @param {Object[]} [input.customAttributes] A list of custom attributes for the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/attributeinput|Storefront API reference} for valid input fields.
   *   @deprecated {String} [input.presentmentCurrencyCode ] A presentment currency code. See the {@link https://help.shopify.com/en/api/storefront-api/reference/enum/currencycode|Storefront API reference} for valid currency code values.
   *   @return {Promise|GraphModel} A promise resolving with the created checkout.
   */
  create(i = {}) {
    const input = this.inputMapper.create(i);

    return this.graphQLClient
      .send(cartCreateMutation, {input})
      .then(handleCartMutation('cartCreate', this.graphQLClient));
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
   *   @param {Object[]} [input.customAttributes] A list of custom attributes for the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/attributeinput|Storefront API reference} for valid input fields.
   *   @param {String} [input.note] A note for the checkout.
   *   @deprecated {Boolean} [input.allowPartialAddresses] An email connected to the checkout.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  updateAttributes(checkoutId, input = {}) {
    const {cartAttributesUpdateInput, cartNoteUpdateInput} = this.inputMapper.updateAttributes(checkoutId, input);
    const promises = [];

    function updateNote() {
      return this.graphQLClient.send(cartNoteUpdateMutation, cartNoteUpdateInput)
        .then(handleCartMutation('cartNoteUpdate', this.graphQLClient));
    }

    function updateAttributes() {
      return this.graphQLClient.send(cartAttributesUpdateMutation, cartAttributesUpdateInput)
        .then(handleCartMutation('cartAttributesUpdate', this.graphQLClient));
    }

    if (typeof cartNoteUpdateInput.note !== 'undefined') {
      promises.push(updateNote.bind(this));
    }

    if (cartAttributesUpdateInput.attributes.length) {
      promises.push(updateAttributes.bind(this));
    }

    return sequentially(promises).then((checkout) => checkout);
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
    const variables = this.inputMapper.updateEmail(checkoutId, email);

    return this.graphQLClient
      .send(cartBuyerIdentityUpdateMutation, variables)
      .then(handleCartMutation('cartBuyerIdentityUpdate', this.graphQLClient));
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
   * @param {Object[]} lineItems A list of line items to add to the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  addLineItems(checkoutId, lineItems = []) {
    const variables = this.inputMapper.addLineItems(checkoutId, lineItems);

    return this.graphQLClient
      .send(cartLinesAddMutation, variables)
      .then(handleCartMutation('cartLinesAdd', this.graphQLClient));
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
    const variables = this.inputMapper.addDiscount(checkoutId, discountCode);

    return this.graphQLClient
      .send(cartDiscountCodesUpdateMutation, variables)
      .then(handleCartMutation('cartDiscountCodesUpdate', this.graphQLClient));
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
   * Replaces the value of a cart's gift card codes
   *
   * @example
   * const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
   * const giftCardCodes = ['jmfxf9wmmmhgq379'];
   *
   * client.cart.updateGiftCardCodes(cartId, giftCardCodes).then((cart) => {
   * // Do something with the updated cart
   * });

   * @param {String} cartId The ID of the cart to update.
   * @param {String[]} [giftCardCodes] The case-insensitive gift card codes.
   * @return {Promise|GraphModel} A promise resolving with the updated cart.
   * */
  updateGiftCardCodes(cartId, giftCardCodes = []) {
    return this.graphQLClient
      .send(cartGiftCardCodesUpdateMutation, {cartId, giftCardCodes})
      .then(handleCartMutation('cartGiftCardCodesUpdate', this.graphQLClient));
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

// This function takes an array of functions that return promises
function sequentially(taskArray) {
  // Start with a resolved promise
  let sequence = Promise.resolve();

  // Chain each function in the taskArray sequentially
  taskArray.forEach((task) => {
    sequence = sequence.then(() => task());
  });

  // Return the final promise to allow handling of the last task's result
  return sequence;
}

export default CartResource;
