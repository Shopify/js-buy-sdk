export default class InputMapper {
  create(input = {}) {
    const cartInput = {};

    // SDK checkout input fields we can map:
    // Ignoring `presentmentCurrencyCode` for now
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
}
