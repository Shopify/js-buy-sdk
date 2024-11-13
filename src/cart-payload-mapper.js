export default class CartPayloadMapper {
  constructor(cart) {
    this.cart = cart;

    // method to map the cart object to the checkout object
    this.checkout = this.checkout.bind(this);

    // individual field mapping methods
    this.appliedGiftCards = this.appliedGiftCards.bind(this);
    this.completedAt = this.completedAt.bind(this);
    this.createdAt = this.createdAt.bind(this);
    this.currencyCode = this.currencyCode.bind(this);
    this.customAttributes = this.customAttributes.bind(this);
    this.discountApplications = this.discountApplications.bind(this);
    this.email = this.email.bind(this);
    this.id = this.id.bind(this);
    this.lineItems = this.lineItems.bind(this);
    this.lineItemsSubtotalPrice = this.lineItemsSubtotalPrice.bind(this);
    this.note = this.note.bind(this);
    this.order = this.order.bind(this);
    this.orderStatusUrl = this.orderStatusUrl.bind(this);
    this.paymentDue = this.paymentDue.bind(this);
    this.paymentDueV2 = this.paymentDue.bind(this);
    this.ready = this.ready.bind(this);
    this.requiresShipping = this.requiresShipping.bind(this);
    this.shippingAddress = this.shippingAddress.bind(this);
    this.shippingLine = this.shippingLine.bind(this);
    this.subtotalPrice = this.subtotalPrice.bind(this);
    this.subtotalPriceV2 = this.subtotalPrice.bind(this);
    this.taxExempt = this.taxExempt.bind(this);
    this.taxesIncluded = this.taxesIncluded.bind(this);
    this.totalPrice = this.totalPrice.bind(this);
    this.totalPriceV2 = this.totalPrice.bind(this);
    this.totalTax = this.totalTax.bind(this);
    this.totalTaxV2 = this.totalTax.bind(this);
    this.updatedAt = this.updatedAt.bind(this);
    this.webUrl = this.webUrl.bind(this);
  }

  checkout(cart) {
    if (cart) {
      this.cart = cart;
    }

    const checkout = {
      appliedGiftCards: this.appliedGiftCards(),
      completedAt: this.completedAt(),
      createdAt: this.createdAt(),
      currencyCode: this.currencyCode(),
      customAttributes: this.customAttributes(),
      discountApplications: this.discountApplications(),
      email: this.email(),
      id: this.id(),
      lineItems: this.lineItems(),
      lineItemsSubtotalPrice: this.lineItemsSubtotalPrice(),
      note: this.note(),
      order: this.order(),
      orderStatusUrl: this.orderStatusUrl(),
      paymentDue: this.paymentDue(),
      paymentDueV2: this.paymentDueV2(),
      ready: this.ready(),
      shippingAddress: this.shippingAddress(),
      shippingLine: this.shippingLine(),
      subtotalPrice: this.subtotalPrice(),
      subtotalPriceV2: this.subtotalPriceV2(),
      taxExempt: this.taxExempt(),
      taxesIncluded: this.taxesIncluded(),
      totalPrice: this.totalPrice(),
      totalPriceV2: this.totalPriceV2(),
      totalTax: this.totalTax(),
      totalTaxV2: this.totalTaxV2(),
      updatedAt: this.updatedAt(),
      webUrl: this.webUrl()
    };

    return checkout;
  }

  appliedGiftCards() {
    return this.cart.appliedGiftCards;
  }

  // Removed from SF API
  completedAt() {
    return null;
  }

  createdAt() {
    return this.cart.createdAt;
  }

  id() {
    return this.cart.id;
  }

  // Removed from SF API
  ready() {
    return false;
  }

  note() {
    return this.cart.note;
  }

  // Removed from SF API
  order() {
    return null;
  }

  email() {
    if (!this.cart.buyerIdentity || !this.cart.buyerIdentity.email) {
      return null;
    }

    return this.cart.buyerIdentity.email;
  }

  paymentDue() {
    // Assuming cart's totalAmount will have the same currency code as gift cards' presentmentAmountUsed
    // TODO - verify this assumption
    return this.moneyField({
      amount: this.cart.cost.totalAmount.amount - this.cart.appliedGiftCards.reduce((acc, giftCard) => acc + giftCard.presentmentAmountUsed.amount, 0),
      currencyCode: this.cart.cost.totalAmount.currencyCode
    });
  }

  webUrl() {
    return this.cart.checkoutUrl;
  }

  // Removed from SF API
  orderStatusUrl() {
    return null;
  }

  // Removed from SF API
  taxExempt() {
    return false; // TODO: investigate default value and posibble parity
  }

  // Removed from SF API
  taxesIncluded() {
    return false; // TODO: investigate default value and posibble parity
  }

  totalPrice() {
    return this.moneyField(this.cart.cost.totalAmount);
  }

  totalTax() {
    // Field is nullable on Cart object but non-nullable on Checkout object
    if (!this.cart.cost.totalTaxAmount) {
      // TODO - do we just want to return null here instead, even though it's non-nullable on the Checkout object?
      return this.moneyField({
        amount: 0,
        currencyCode: this.cart.cost.totalAmount.currencyCode
      });
    }

    return this.moneyField(this.cart.cost.totalTaxAmount);
  }

  updatedAt() {
    return this.cart.updatedAt;
  }

  currencyCode() {
    return this.cart.cost.totalAmount.currencyCode;
  }

  lineItems(passedLines) {
    const lines = passedLines || this.cart.lines;

    if (!lines) {
      return [];
    }

    // TODO: implement lineItem mapping of all fields
    return lines.edges.map(({node}) => node);
  }

  lineItemsSubtotalPrice() {
    return this.moneyField(this.cart.cost.checkoutChargeAmount);
  }

  customAttributes() {
    return this.cart.attributes.map((attr) => {
      return {
        key: attr.key,
        value: attr.value,
        type: {
          name: 'Attribute',
          kind: 'OBJECT',
          fieldBaseTypes: {
            key: 'String',
            value: 'String'
          },
          implementsNode: false
        }
      };
    });
  }

  // TODO: implement for all test cases
  discountApplications() {
    const applicableDiscountCodes = this.cart.discountCodes.filter((discount) => {
      return discount.applicable;
    });

    if (!applicableDiscountCodes.length) {
      return [];
    }

    return this.cart.discountAllocations.map((discount) => {
      return {
        targetSelection: discount.targetSelection,
        targetType: discount.targetType,
        value: discount.value,
        allocationMethod: discount.allocationMethod,
        // TODO: implement the rest of the fields
        type: {
          name: 'DiscountApplication',
          kind: 'OBJECT',
          fieldBaseTypes: {
            targetSelection: 'DiscountApplicationTargetSelection',
            targetType: 'DiscountApplicationTargetType',
            value: 'PricingValue',
            allocationMethod: 'DiscountApplicationAllocationMethod'
          },
          implementsNode: false
        }
      };
    });
  }

  // Removed from SF API
  requiresShipping() {
    return null;
  }

  shippingAddress() {
    if (!this.cart.buyerIdentity || !this.cart.buyerIdentity.deliveryAddressPreferences.length) {
      return null;
    }

    return this.cart.buyerIdentity.deliveryAddressPreferences[0];
  }

  // Removed from SF API
  shippingLine() {
    // TODO: can we implement this at all?
    return null;
  }

  subtotalPrice() {
    return this.moneyField({
      amount: this.cart.cost.totalAmount.amount -
        (this.cart.cost.totalDutyAmount ? this.cart.cost.totalDutyAmount.amount : 0) -
        (this.cart.cost.totalTaxAmount ? this.cart.cost.totalTaxAmount.amount : 0),
      currencyCode: this.cart.cost.totalAmount.currencyCode
    });
  }

  // utilities
  moneyField(field) {
    if (!field) {
      return null;
    }

    return {
      amount: field.amount,
      currencyCode: field.currencyCode,
      type: {
        name: 'MoneyV2',
        kind: 'OBJECT',
        fieldBaseTypes: {
          amount: 'Decimal',
          currencyCode: 'CurrencyCode'
        },
        implementsNode: false
      }
    };
  }
}
