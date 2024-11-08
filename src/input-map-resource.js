export default class InputMapper {
  create(input = {}) {
    const cartInput = {};

    if (input.presentmentCurrencyCode) {
      // NOTE: Not supported by the Cart API
    }

    // SDK checkout input fields we can map:
    if (input.lineItems) {
      cartInput.lines = input.lineItems.map((lineItem) => {
        lineItem.merchandiseId = lineItem.variantId;
        delete lineItem.variantId;

        return lineItem;
      });
    }

    if (input.note) { cartInput.note = input.note; }

    if (input.email) { cartInput.buyerIdentity = {email: input.email}; }

    if (input.shippingAddress) {
      if (!cartInput.buyerIdentity) { cartInput.buyerIdentity = {}; }
      cartInput.buyerIdentity.deliveryAddressPreferences = [{deliveryAddress: input.shippingAddress}];
    }

    if (input.customAttributes) { cartInput.attributes = input.customAttributes; }

    // Fields that aren't documented in SDK but could still be passed in:
    // Ignoring `allowPartialAddresses` for now
    if (input.buyerIdentity) {
      if (!cartInput.buyerIdentity) { cartInput.buyerIdentity = {}; }
      cartInput.buyerIdentity.countryCode = input.buyerIdentity.countryCode;
    }

    return cartInput;
  }

  updateAttributes(checkoutId, input) {
    const cartAttributesUpdateInput = {
      attributes: [],
      cartId: ''
    };

    const cartNoteUpdateInput = {
      cartId: '',
      note: ''
    };

    if (checkoutId) {
      cartAttributesUpdateInput.cartId = checkoutId;
      cartNoteUpdateInput.cartId = checkoutId;
    }

    if (input.customAttributes) {
      cartAttributesUpdateInput.attributes = input.customAttributes;
    }

    if (input.note) {
      cartNoteUpdateInput.note = input.note;
    }

    if (input.allowPartialAddresses) {
      // Ignoring `allowPartialAddresses` for now
    }

    // With cart, we will need to execute two separate mutations (one for attributes and one for note)
    return {cartAttributesUpdateInput, cartNoteUpdateInput};
  }

  updateEmail(checkoutId, email) {
    const cartBuyerIdentityInput = {
      buyerIdentity: {email},
      cartId: checkoutId
    };

    return cartBuyerIdentityInput;
  }

  addLineItems(checkoutId, lineItems) {
    return {
      cartId: checkoutId,
      lines: lineItems.map((lineItem) => {
        const line = {};

        if (lineItem.customAttributes) {
          line.attributes = lineItem.customAttributes;
        }

        if (lineItem.quantity) {
          line.quantity = lineItem.quantity;
        }

        if (lineItem.variantId) {
          line.merchandiseId = lineItem.variantId;
        }

        return line;
      })
    };
  }

  addDiscount(checkoutId, discountCode) {
    return {
      cartId: checkoutId,
      // NOTE: Checkout support only one discount code
      discountCodes: Array.isArray(discountCode)
        ? discountCode[0]
        : discountCode
          ? [discountCode]
          : []
    };
  }
}
