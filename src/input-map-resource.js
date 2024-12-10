export default class InputMapper {
  create(input = {}) {
    const cartInput = {};

    if (input.presentmentCurrencyCode) {
      // eslint-disable-next-line no-console
      console.warn('presentmentCurrencyCode is not supported by the Cart API');
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
      discountCodes: discountCode ? [discountCode] : []
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
    return {
      cartId: checkoutId,
      lineIds: lineItemIds ? lineItemIds : []
    };
  }

  replaceLineItems(checkoutId, lineItems) {
    return {
      cartId: checkoutId,
      lines: lineItems.map((lineItem) => {
        const line = {};

        if (lineItem.quantity) {
          line.quantity = lineItem.quantity;
        }

        if (lineItem.variantId) {
          line.merchandiseId = lineItem.variantId;
        }

        if (lineItem.customAttributes) {
          line.attributes = lineItem.customAttributes;
        }

        return line;
      })
    };
  }

  updateLineItems(checkoutId, lineItems) {
    return {
      cartId: checkoutId,
      lines: lineItems.map((lineItem) => {
        if (!lineItem.id) {
          return null;
        }

        const line = {id: lineItem.id};

        if (lineItem.quantity) {
          line.quantity = lineItem.quantity;
        }

        if (lineItem.variantId) {
          line.merchandiseId = lineItem.variantId;
        }

        if (lineItem.customAttributes) {
          line.attributes = lineItem.customAttributes;
        }

        return line;
      }).filter(Boolean)
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

    const withDeliveryAddress = deliveryAddress && Object.keys(deliveryAddress).length > 0;

    return {
      cartId: checkoutId,
      buyerIdentity: {
        deliveryAddressPreferences: withDeliveryAddress ? [{deliveryAddress}] : []
      }
    };
  }
}
