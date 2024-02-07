import Resource from './resource';
import defaultResolver from './default-resolver';
import handleCartMutation from './handle-cart-mutation';

/*
- [x] cartCreate
- [x] fetch
- [x] cartAttributesUpdate
- [x] cartBuyerIdentityUpdate
- [x] cartDiscountCodesUpdate

- [ ] cartLinesAdd
- [ ] cartLinesRemove
- [ ] cartLinesUpdate
- [ ] cartNoteUpdate
- [ ] cartSelectedDeliveryOptionsUpdate
*/

// GraphQL
import cartNodeQuery from './graphql/cartNodeQuery.graphql';
import cartCreateMutation from './graphql/cartCreateMutation.graphql';
import cartAttributesUpdate from './graphql/cartAttributesUpdateMutation.graphql';
import cartBuyerIdentityUpdate from './graphql/cartBuyerIdentityUpdate.graphql';

// import checkoutLineItemsAddMutation from './graphql/checkoutLineItemsAddMutation.graphql';
// import checkoutLineItemsRemoveMutation from './graphql/checkoutLineItemsRemoveMutation.graphql';
// import checkoutLineItemsReplaceMutation from './graphql/checkoutLineItemsReplaceMutation.graphql';
// import checkoutLineItemsUpdateMutation from './graphql/checkoutLineItemsUpdateMutation.graphql';
// import checkoutDiscountCodeApplyV2Mutation from './graphql/checkoutDiscountCodeApplyV2Mutation.graphql';
// import checkoutDiscountCodeRemoveMutation from './graphql/checkoutDiscountCodeRemoveMutation.graphql';
// import checkoutGiftCardsAppendMutation from './graphql/checkoutGiftCardsAppendMutation.graphql';
// import checkoutGiftCardRemoveV2Mutation from './graphql/checkoutGiftCardRemoveV2Mutation.graphql';
// import checkoutShippingAddressUpdateV2Mutation from './graphql/checkoutShippingAddressUpdateV2Mutation.graphql';

/**
 * The JS Buy SDK checkout resource
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
   *   @param {String} [input.buyerIdentity.email] An email connected to the checkout.
   *   @param {Object[]} [input.lines] A list of line items in the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
   *   @param {Object} [input.deliveryAddressPreferences.deliveryAddress] A shipping address. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/mailingaddressinput|Storefront API reference} for valid input fields.
   *   @param {String} [input.note] A note for the checkout.
   *   @param {Object[]} [input.attributes] A list of custom attributes for the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/attributeinput|Storefront API reference} for valid input fields.
   * @return {Promise|GraphModel} A promise resolving with the created checkout.
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
      .send(cartAttributesUpdate, {cartId, attributes})
      .then(handleCartMutation('cartAttributesUpdate', this.graphQLClient));
  }

  /**
   * Replaces the value of a cart's buyer identity
   * @example
   * const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
   * const buyerIdentity = {email: "hello@hi.com"};
   * client.cart.updateBuyerIdentity(cartId, buyerIdentity).then((cart) => {
   *  // Do something with the updated cart
   * });
   * @param {String} cartId The ID of the cart to update.
   * @param {Object} [buyerIdentity] A list of additional information about the cart. See the {@link https://shopify.dev/docs/api/storefront/unstable/input-objects/AttributeInput|Storefront API reference} for valid input fields.
   * @return {Promise|GraphModel} A promise resolving with the updated cart.
   * */
  updateBuyerIdentity(cartId, buyerIdentity = {}) {
    return this.graphQLClient
      .send(cartBuyerIdentityUpdate, {cartId, buyerIdentity})
      .then(handleCartMutation('cartBuyerIdentityUpdate', this.graphQLClient));
  }

  // /**
  //  * Replaces the value of checkout's email address
  //  *
  //  * @example
  //  * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
  //  * const email = 'user@example.com';
  //  *
  //  * client.checkout.updateEmail(checkoutId, email).then((checkout) => {
  //  *   // Do something with the updated checkout
  //  * });
  //  *
  //  * @param {String} checkoutId The ID of the checkout to update.
  //  * @param {String} email The email address to apply to the checkout.
  //  * @return {Promise|GraphModel} A promise resolving with the updated checkout.
  //  */
  // updateEmail(checkoutId, email) {
  //   return this.graphQLClient
  //     .send(checkoutEmailUpdateV2Mutation, {checkoutId, email})
  //     .then(handleCheckoutMutation('checkoutEmailUpdateV2', this.graphQLClient));
  // }

  // /**
  //  * Adds line items to an existing checkout.
  //  *
  //  * @example
  //  * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
  //  * const lineItems = [{variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}];
  //  *
  //  * client.checkout.addLineItems(checkoutId, lineItems).then((checkout) => {
  //  *   // Do something with the updated checkout
  //  * });
  //  *
  //  * @param {String} checkoutId The ID of the checkout to add line items to.
  //  * @param {Object[]} lineItems A list of line items to add to the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
  //  * @return {Promise|GraphModel} A promise resolving with the updated checkout.
  //  */
  // addLineItems(checkoutId, lineItems) {
  //   return this.graphQLClient
  //     .send(checkoutLineItemsAddMutation, {checkoutId, lineItems})
  //     .then(handleCheckoutMutation('checkoutLineItemsAdd', this.graphQLClient));
  // }

  // /**
  //  * Applies a discount to an existing checkout using a discount code.
  //  *
  //  * @example
  //  * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
  //  * const discountCode = 'best-discount-ever';
  //  *
  //  * client.checkout.addDiscount(checkoutId, discountCode).then((checkout) => {
  //  *   // Do something with the updated checkout
  //  * });
  //  *
  //  * @param {String} checkoutId The ID of the checkout to add discount to.
  //  * @param {String} discountCode The discount code to apply to the checkout.
  //  * @return {Promise|GraphModel} A promise resolving with the updated checkout.
  //  */
  // addDiscount(checkoutId, discountCode) {
  //   return this.graphQLClient
  //     .send(checkoutDiscountCodeApplyV2Mutation, {checkoutId, discountCode})
  //     .then(handleCheckoutMutation('checkoutDiscountCodeApplyV2', this.graphQLClient));
  // }

  // /**
  //  * Removes the applied discount from an existing checkout.
  //  *
  //  * @example
  //  * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
  //  *
  //  * client.checkout.removeDiscount(checkoutId).then((checkout) => {
  //  *   // Do something with the updated checkout
  //  * });
  //  *
  //  * @param {String} checkoutId The ID of the checkout to remove the discount from.
  //  * @return {Promise|GraphModel} A promise resolving with the updated checkout.
  //  */
  // removeDiscount(checkoutId) {
  //   return this.graphQLClient
  //     .send(checkoutDiscountCodeRemoveMutation, {checkoutId})
  //     .then(handleCheckoutMutation('checkoutDiscountCodeRemove', this.graphQLClient));
  // }

  // /**
  //  * Applies gift cards to an existing checkout using a list of gift card codes
  //  *
  //  * @example
  //  * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
  //  * const giftCardCodes = ['6FD8853DAGAA949F'];
  //  *
  //  * client.checkout.addGiftCards(checkoutId, giftCardCodes).then((checkout) => {
  //  *   // Do something with the updated checkout
  //  * });
  //  *
  //  * @param {String} checkoutId The ID of the checkout to add gift cards to.
  //  * @param {String[]} giftCardCodes The gift card codes to apply to the checkout.
  //  * @return {Promise|GraphModel} A promise resolving with the updated checkout.
  //  */
  // addGiftCards(checkoutId, giftCardCodes) {
  //   return this.graphQLClient
  //     .send(checkoutGiftCardsAppendMutation, {checkoutId, giftCardCodes})
  //     .then(handleCheckoutMutation('checkoutGiftCardsAppend', this.graphQLClient));
  // }

  // /**
  //  * Remove a gift card from an existing checkout
  //  *
  //  * @example
  //  * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
  //  * const appliedGiftCardId = 'Z2lkOi8vc2hvcGlmeS9BcHBsaWVkR2lmdENhcmQvNDI4NTQ1ODAzMTI=';
  //  *
  //  * client.checkout.removeGiftCard(checkoutId, appliedGiftCardId).then((checkout) => {
  //  *   // Do something with the updated checkout
  //  * });
  //  *
  //  * @param {String} checkoutId The ID of the checkout to add gift cards to.
  //  * @param {String} appliedGiftCardId The gift card id to remove from the checkout.
  //  * @return {Promise|GraphModel} A promise resolving with the updated checkout.
  //  */
  // removeGiftCard(checkoutId, appliedGiftCardId) {
  //   return this.graphQLClient
  //     .send(checkoutGiftCardRemoveV2Mutation, {checkoutId, appliedGiftCardId})
  //     .then(handleCheckoutMutation('checkoutGiftCardRemoveV2', this.graphQLClient));
  // }

  // /**
  //  * Removes line items from an existing checkout.
  //  *
  //  * @example
  //  * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
  //  * const lineItemIds = ['TViZGE5Y2U1ZDFhY2FiMmM2YT9rZXk9NTc2YjBhODcwNWIxYzg0YjE5ZjRmZGQ5NjczNGVkZGU='];
  //  *
  //  * client.checkout.removeLineItems(checkoutId, lineItemIds).then((checkout) => {
  //  *   // Do something with the updated checkout
  //  * });
  //  *
  //  * @param {String} checkoutId The ID of the checkout to remove line items from.
  //  * @param {String[]} lineItemIds A list of the ids of line items to remove from the checkout.
  //  * @return {Promise|GraphModel} A promise resolving with the updated checkout.
  //  */
  // removeLineItems(checkoutId, lineItemIds) {
  //   return this.graphQLClient
  //     .send(checkoutLineItemsRemoveMutation, {checkoutId, lineItemIds})
  //     .then(handleCheckoutMutation('checkoutLineItemsRemove', this.graphQLClient));
  // }

  // /**
  //  * Replace line items on an existing checkout.
  //  *
  //  * @example
  //  * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
  //  * const lineItems = [{variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}];
  //  *
  //  * client.checkout.replaceLineItems(checkoutId, lineItems).then((checkout) => {
  //  *   // Do something with the updated checkout
  //  * });
  //  *
  //  * @param {String} checkoutId The ID of the checkout to add line items to.
  //  * @param {Object[]} lineItems A list of line items to set on the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
  //  * @return {Promise|GraphModel} A promise resolving with the updated checkout.
  //  */
  // replaceLineItems(checkoutId, lineItems) {
  //   return this.graphQLClient
  //     .send(checkoutLineItemsReplaceMutation, {checkoutId, lineItems})
  //     .then(handleCheckoutMutation('checkoutLineItemsReplace', this.graphQLClient));
  // }

  // /**
  //  * Updates line items on an existing checkout.
  //  *
  //  * @example
  //  * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
  //  * const lineItems = [
  //  *   {
  //  *     id: 'TViZGE5Y2U1ZDFhY2FiMmM2YT9rZXk9NTc2YjBhODcwNWIxYzg0YjE5ZjRmZGQ5NjczNGVkZGU=',
  //  *     quantity: 5,
  //  *     variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg=='
  //  *   }
  //  * ];
  //  *
  //  * client.checkout.updateLineItems(checkoutId, lineItems).then(checkout => {
  //  *   // Do something with the updated checkout
  //  * });
  //  *
  //  * @param {String} checkoutId The ID of the checkout to update a line item on.
  //  * @param {Object[]} lineItems A list of line item information to update. See the {@link https://help.shopify.com/api/storefront-api/reference/input-object/checkoutlineitemupdateinput|Storefront API reference} for valid input fields for each line item.
  //  * @return {Promise|GraphModel} A promise resolving with the updated checkout.
  //  */
  // updateLineItems(checkoutId, lineItems) {
  //   return this.graphQLClient
  //     .send(checkoutLineItemsUpdateMutation, {checkoutId, lineItems})
  //     .then(handleCheckoutMutation('checkoutLineItemsUpdate', this.graphQLClient));
  // }

  // /**
  //  * Updates shipping address on an existing checkout.
  //  *
  //  * @example
  //  * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
  //  * const shippingAddress = {
  //  *    address1: 'Chestnut Street 92',
  //  *    address2: 'Apartment 2',
  //  *    city: 'Louisville',
  //  *    company: null,
  //  *    country: 'United States',
  //  *    firstName: 'Bob',
  //  *    lastName: 'Norman',
  //  *    phone: '555-625-1199',
  //  *    province: 'Kentucky',
  //  *    zip: '40202'
  //  *  };
  //  *
  //  * client.checkout.updateShippingAddress(checkoutId, shippingAddress).then(checkout => {
  //  *   // Do something with the updated checkout
  //  * });
  //  *
  //  * @param  {String} checkoutId The ID of the checkout to update shipping address.
  //  * @param  {Object} shippingAddress A shipping address.
  //  * @return {Promise|GraphModel} A promise resolving with the updated checkout.
  //  */
  // updateShippingAddress(checkoutId, shippingAddress) {
  //   return this.graphQLClient
  //     .send(checkoutShippingAddressUpdateV2Mutation, {checkoutId, shippingAddress})
  //     .then(handleCheckoutMutation('checkoutShippingAddressUpdateV2', this.graphQLClient));
  // }
}

export default CartResource;
