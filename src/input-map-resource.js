export default class InputMapper {
  create(input = {}) {
    const cartInput = {};

    if (input.presentmentCurrencyCode) {
      // eslint-disable-next-line no-console
      console.warn('presentmentCurrencyCode is not supported by the Cart API');
    }

    // SDK checkout input fields we can map:
    if (input.lineItems && input.lineItems.length) {
      cartInput.lines = input.lineItems.map((lineItem) => {
        lineItem.merchandiseId = lineItem.variantId;
        delete lineItem.variantId;

        return lineItem;
      });
    }

    if (input.note) {
      cartInput.note = input.note;
    }

    if (input.email) {
      cartInput.buyerIdentity = { email: input.email };
    }

    if (input.shippingAddress) {
      if (!cartInput.buyerIdentity) {
        cartInput.buyerIdentity = {};
      }
      cartInput.buyerIdentity.deliveryAddressPreferences = [
        { deliveryAddress: input.shippingAddress }
      ];
    }

    if (input.customAttributes) {
      cartInput.attributes = input.customAttributes;
    }

    // Fields that aren't documented in SDK but could still be passed in:
    if (input.buyerIdentity) {
      if (!cartInput.buyerIdentity) {
        cartInput.buyerIdentity = {};
      }
      cartInput.buyerIdentity.countryCode = input.buyerIdentity.countryCode;
    }

    if (input.allowPartialAddresses) {
      // eslint-disable-next-line no-console
      console.warn('allowPartialAddresses is not supported by the Cart API');
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
      // eslint-disable-next-line no-console
      console.warn('allowPartialAddresses is not supported by the Cart API');
    }

    // With cart, we will need to execute two separate mutations (one for attributes and one for note)
    return { cartAttributesUpdateInput, cartNoteUpdateInput };
  }

  updateEmail(checkoutId, email) {
    const cartBuyerIdentityInput = {
      buyerIdentity: { email },
      cartId: checkoutId
    };

    return cartBuyerIdentityInput;
  }

  addLineItems(checkoutId, lineItems) {
    const lines = Array.isArray(lineItems) ? lineItems : [lineItems];

    return {
      cartId: checkoutId,
      lines: lines.map(mapLineItemToLine).filter(Boolean)
    };
  }

  addDiscount(checkoutId, discountCodes) {
    return {
      cartId: checkoutId,
      discountCodes: Array.isArray(discountCodes) ? discountCodes.flat() : []
    };
  }

  removeDiscount(checkoutId) {
    return {
      cartId: checkoutId,
      discountCodes: []
    };
  }

  addGiftCards(checkoutId, giftCardCodes) {
    return {
      cartId: checkoutId,
      giftCardCodes: giftCardCodes || []
    };
  }

  removeGiftCard(checkoutId, appliedGiftCardId) {
    return {
      cartId: checkoutId,
      appliedGiftCardIds: appliedGiftCardId ? [appliedGiftCardId] : []
    };
  }

  removeLineItems(checkoutId, lineItemIds) {
    const lineIds = Array.isArray(lineItemIds) ? lineItemIds : [lineItemIds];

    return {
      cartId: checkoutId,
      lineIds
    };
  }

  replaceLineItems(checkoutId, lineItems) {
    const lines = Array.isArray(lineItems) ? lineItems : [lineItems];

    return {
      cartId: checkoutId,
      lines: lines.map(mapLineItemToLine).filter(Boolean)
    };
  }

  updateLineItems(checkoutId, lineItems) {
    const lines = Array.isArray(lineItems) ? lineItems : [lineItems];

    return {
      cartId: checkoutId,
      lines: lines.map(mapLineItemToLine).filter(Boolean)
    };
  }

  updateShippingAddress(checkoutId, shippingAddress) {
    const deliveryAddress = {};

    if (shippingAddress.address1) {
      deliveryAddress.address1 = shippingAddress.address1;
    }

    if (shippingAddress.address2) {
      deliveryAddress.address2 = shippingAddress.address2;
    }

    if (shippingAddress.city) {
      deliveryAddress.city = shippingAddress.city;
    }

    if (shippingAddress.company) {
      deliveryAddress.company = shippingAddress.company;
    }

    if (shippingAddress.country) {
      deliveryAddress.country = shippingAddress.country;
    }

    if (shippingAddress.firstName) {
      deliveryAddress.firstName = shippingAddress.firstName;
    }

    if (shippingAddress.lastName) {
      deliveryAddress.lastName = shippingAddress.lastName;
    }

    if (shippingAddress.phone) {
      deliveryAddress.phone = shippingAddress.phone;
    }

    if (shippingAddress.zip) {
      deliveryAddress.zip = shippingAddress.zip;
    }

    if (shippingAddress.province) {
      deliveryAddress.province = shippingAddress.province;
    }

    const withDeliveryAddress =
      deliveryAddress && (Object.keys(deliveryAddress).length > 0);

    return {
      cartId: checkoutId,
      buyerIdentity: {
        deliveryAddressPreferences: withDeliveryAddress
          ? [{ deliveryAddress }]
          : []
      }
    };
  }
}

function mapLineItemToLine(lineItem) {
  const line = {};

  if (typeof lineItem.id !== 'undefined') {
    line.id = lineItem.id;
  }

  if (typeof lineItem.customAttributes !== 'undefined') {
    line.attributes = lineItem.customAttributes;
  }

  if (typeof lineItem.quantity !== 'undefined') {
    line.quantity = lineItem.quantity;
  }

  if (typeof lineItem.variantId !== 'undefined') {
    line.merchandiseId = lineItem.variantId;
  }

  if (Object.keys(line).length === 0) {
    return null;
  }

  return line;
}
