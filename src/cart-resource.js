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
import cartGiftCardCodesRemoveMutation from './graphql/cartGiftCardCodesRemoveMutation.graphql';

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
      .then(defaultResolver('cart', this.graphQLClient));
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
    const variables = this.inputMapper.removeDiscount(checkoutId);

    return this.graphQLClient
      .send(cartDiscountCodesUpdateMutation, variables)
      .then(handleCartMutation('cartDiscountCodesUpdate', this.graphQLClient));
  }

    /**
   * Applies gift cards to an existing checkout using a list of gift card codes
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const giftCardCodes = ['6FD8853DAGAA949F'];
   *
   * client.checkout.addGiftCards(checkoutId, giftCardCodes).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to add gift cards to.
   * @param {String[]} giftCardCodes The gift card codes to apply to the checkout.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  addGiftCards(checkoutId, giftCardCodes) {
    const variables = this.inputMapper.addGiftCards(checkoutId, giftCardCodes);

    return this.graphQLClient
      .send(cartGiftCardCodesUpdateMutation, variables)
      .then(handleCartMutation('cartGiftCardCodesUpdate', this.graphQLClient));
  }

  /**
   * Remove a gift card from an existing checkout
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const appliedGiftCardId = 'Z2lkOi8vc2hvcGlmeS9BcHBsaWVkR2lmdENhcmQvNDI4NTQ1ODAzMTI=';
   *
   * client.checkout.removeGiftCard(checkoutId, appliedGiftCardId).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to add gift cards to.
   * @param {String} appliedGiftCardId The gift card id to remove from the checkout.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  removeGiftCard(checkoutId, appliedGiftCardId) {
    const variables = this.inputMapper.removeGiftCard(checkoutId, appliedGiftCardId);

    return this.graphQLClient
      .send(cartGiftCardCodesRemoveMutation, variables)
      .then(handleCartMutation('cartGiftCardCodesRemove', this.graphQLClient));
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
  removeLineItems(checkoutId, lineIds = []) {
    const variables = this.inputMapper.removeLineItems(checkoutId, lineIds);

    return this.graphQLClient
      .send(cartLinesRemoveMutation, variables)
      .then(handleCartMutation('cartLinesRemove', this.graphQLClient));
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
   * @param {Object[]} lineItems A list of line items to set on the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  replaceLineItems(checkoutId, lineItems) {
    let checkout;

    function getExistingCart() {
      checkout = this.fetch(checkoutId);

      return checkout;
    }

    // remove all existing lines
    function removeExistingLines() {
      const lineIds = checkout.lineItems.map((lineItem) => lineItem.id);

      return this.removeLineItems(checkoutId, lineIds);
    }

    // add the replacing lines
    function addReplacingLines() {
      return this.addLineItems(checkoutId, lineItems);
    }

    return sequentially([
      getExistingCart.bind(this),
      removeExistingLines.bind(this),
      addReplacingLines.bind(this)
    ]);
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
   * @param {Object[]} lineItems A list of line item information to update. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/checkoutlineitemupdateinput|Storefront API reference} for valid input fields for each line item.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  updateLineItems(checkoutId, lineItems) {
    const variables = this.inputMapper.updateLineItems(checkoutId, lineItems);

    return this.graphQLClient
      .send(cartLinesUpdateMutation, variables)
      .then(handleCartMutation('cartLinesUpdate', this.graphQLClient));
  }

  /**
   * Updates shipping address on an existing checkout.
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const shippingAddress = {
   *    address1: 'Chestnut Street 92',
   *    address2: 'Apartment 2',
   *    city: 'Louisville',
   *    company: null,
   *    country: 'United States',
   *    firstName: 'Bob',
   *    lastName: 'Norman',
   *    phone: '555-625-1199',
   *    province: 'Kentucky',
   *    zip: '40202'
   *  };
   *
   * client.checkout.updateShippingAddress(checkoutId, shippingAddress).then(checkout => {
   *   // Do something with the updated checkout
   * });
   *
   * @param  {String} checkoutId The ID of the checkout to update shipping address.
   * @param  {Object} shippingAddress A shipping address.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  updateShippingAddress(checkoutId, shippingAddress) {
    const variables = this.inputMapper.updateShippingAddress(checkoutId, shippingAddress);

    return this.graphQLClient
      .send(cartBuyerIdentityUpdateMutation, variables)
      .then(handleCartMutation('cartBuyerIdentityUpdate', this.graphQLClient));
  }
}

// Execute an array of functions sequentially and return the result of the last promise
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
