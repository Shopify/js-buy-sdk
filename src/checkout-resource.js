import Resource from "./resource";
import handleCartMutation from "./handle-cart-mutation";
import { mapCartPayload } from "./cart-payload-mapper";

import cartNodeQuery from "./graphql/CartNodeQuery.graphql";
import cartCreateMutation from "./graphql/CartCreateMutation.graphql";
import cartAttributesUpdateMutation from "./graphql/CartAttributesUpdateMutation.graphql";
import cartBuyerIdentityUpdateMutation from "./graphql/CartBuyerIdentityUpdateMutation.graphql";
import cartDiscountCodesUpdateMutation from "./graphql/CartDiscountCodesUpdateMutation.graphql";
import cartGiftCardCodesUpdateMutation from "./graphql/CartGiftCardCodesUpdateMutation.graphql";
import cartLinesAddMutation from "./graphql/CartLinesAddMutation.graphql";
import cartLinesRemoveMutation from "./graphql/CartLinesRemoveMutation.graphql";
import cartLinesUpdateMutation from "./graphql/CartLinesUpdateMutation.graphql";
import cartNoteUpdateMutation from "./graphql/CartNoteUpdateMutation.graphql";
import cartGiftCardCodesRemoveMutation from "./graphql/CartGiftCardCodesRemoveMutation.graphql";

/**
 * The JS Buy SDK cart resource
 * @class
 */
class CheckoutResource extends Resource {
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
      .send(cartNodeQuery, { id })
      .then(({ model, data }) => {
        return new Promise((resolve, reject) => {
          try {
            const cart = data.cart || data.node;

            if (!cart) {
              return resolve(null);
            }

            return this.graphQLClient
              .fetchAllPages(model.cart.lines, { pageSize: 250 })
              .then((lines) => {
                model.cart.attrs.lines = lines;

                return resolve(mapCartPayload(model.cart));
              });
          } catch (error) {
            if (error) {
              reject(error);
            } else {
              reject([{ message: "an unknown error has occurred." }]);
            }
          }

          return resolve(null);
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
      .send(cartCreateMutation, { input })
      .then(handleCartMutation("cartCreate", this.graphQLClient));
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
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  updateAttributes(checkoutId, input = {}) {
    const { cartAttributesUpdateInput, cartNoteUpdateInput } =
      this.inputMapper.updateAttributes(checkoutId, input);
    let promise = Promise.resolve();

    function updateNote() {
      return this.graphQLClient
        .send(cartNoteUpdateMutation, cartNoteUpdateInput)
        .then(handleCartMutation("cartNoteUpdate", this.graphQLClient));
    }

    function updateAttributes() {
      return this.graphQLClient
        .send(cartAttributesUpdateMutation, cartAttributesUpdateInput)
        .then(handleCartMutation("cartAttributesUpdate", this.graphQLClient));
    }

    if (typeof cartNoteUpdateInput.note !== "undefined") {
      promise = promise.then(() => updateNote.call(this));
    }

    if (cartAttributesUpdateInput.attributes.length) {
      promise = promise.then(() => updateAttributes.call(this));
    }

    return promise;
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
      .then(handleCartMutation("cartBuyerIdentityUpdate", this.graphQLClient));
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
      .then(handleCartMutation("cartLinesAdd", this.graphQLClient));
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
    return this.fetch(checkoutId).then((checkout) => {
      const existingRootCodes = checkout.discountApplications.map(
        (discountApplication) => discountApplication.code
      );

      const existtingLineCodes = checkout.lineItems.map((lineItem) => {
        return lineItem.discountAllocations.map(
          ({ discountApplication }) => discountApplication.code
        );
      });

      // get unique applied codes
      const existingCodes = Array.from(
        new Set([...existingRootCodes, ...existtingLineCodes.flat()])
      );

      const variables = this.inputMapper.addDiscount(
        checkoutId,
        existingCodes.concat(discountCode)
      );

      return this.graphQLClient
        .send(cartDiscountCodesUpdateMutation, variables)
        .then(
          handleCartMutation("cartDiscountCodesUpdate", this.graphQLClient)
        );
    });
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
      .then(handleCartMutation("cartDiscountCodesUpdate", this.graphQLClient));
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
      .then(handleCartMutation("cartGiftCardCodesUpdate", this.graphQLClient));
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
    const variables = this.inputMapper.removeGiftCard(
      checkoutId,
      appliedGiftCardId
    );

    return this.graphQLClient
      .send(cartGiftCardCodesRemoveMutation, variables)
      .then(handleCartMutation("cartGiftCardCodesRemove", this.graphQLClient));
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
      .then(handleCartMutation("cartLinesRemove", this.graphQLClient));
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
    return this.fetch(checkoutId)
      .then((checkout) => {
        const lineIds = checkout.lineItems.map((lineItem) => lineItem.id);

        return this.removeLineItems(checkoutId, lineIds);
      })
      .then(() => {
        return this.addLineItems(checkoutId, lineItems);
      });
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
      .then(handleCartMutation("cartLinesUpdate", this.graphQLClient));
  }

  /**
   * Updates shipping address on an existing checkout.
   *
   * @example
   * const checkoutId = `'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
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
    const variables = this.inputMapper.updateShippingAddress(
      checkoutId,
      shippingAddress
    );

    return this.graphQLClient
      .send(cartBuyerIdentityUpdateMutation, variables)
      .then(handleCartMutation("cartBuyerIdentityUpdate", this.graphQLClient));
  }
}

export default CheckoutResource;
