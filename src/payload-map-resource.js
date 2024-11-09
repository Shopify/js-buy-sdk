export default class PayloadMapper {
  constructor(graphQLClient) {
    this.graphQLClient = graphQLClient;
    this.cart = {};

    // method to map the cart object to the checkout object
    this.checkout = this.checkout.bind(this);

    // individual field mapping methods
    this.appliedGiftCards = this.appliedGiftCards.bind(this);
    this.currencyCode = this.currencyCode.bind(this);
    this.customAttributes = this.customAttributes.bind(this);
    this.discountApplications = this.discountApplications.bind(this);
    this.email = this.email.bind(this);
    this.id = this.id.bind(this);
    this.lineItems = this.lineItems.bind(this);
    this.note = this.note.bind(this);
    this.orderStatusUrl = this.orderStatusUrl.bind(this);
    this.paymentDue = this.paymentDue.bind(this);
    this.paymentDueV2 = this.paymentDueV2.bind(this);
    this.ready = this.ready.bind(this);
    this.shippingAddress = this.shippingAddress.bind(this);
    this.taxExempt = this.taxExempt.bind(this);
    this.taxesIncluded = this.taxesIncluded.bind(this);
    this.webUrl = this.webUrl.bind(this);
  }

  checkout(cart) {
    this.cart = cart;

    const checkout = {
      appliedGiftCards: this.appliedGiftCards(),
      currencyCode: this.currencyCode(),
      customAttributes: this.customAttributes(),
      discountApplications: this.discountApplications(),
      email: this.email(),
      id: this.id(),
      lineItems: this.lineItems(),
      note: this.note(),
      orderStatusUrl: this.orderStatusUrl(),
      paymentDue: this.paymentDue(),
      paymentDueV2: this.paymentDueV2(),
      ready: this.ready(),
      shippingAddress: this.shippingAddress(),
      taxExempt: this.taxExempt(),
      taxesIncluded: this.taxesIncluded(),
      webUrl: this.webUrl()
    };

    return checkout;
  }

  // TODO: implement fully
  appliedGiftCards() {
    return this.cart.appliedGiftCards;
  }

  id() {
    return this.cart.id;
  }

  ready() {
    return false;
  }

  note() {
    return this.cart.note;
  }

  email() {
    if (!this.cart.buyerIdentity || !this.cart.buyerIdentity.email) {
      return null;
    }

    return this.cart.buyerIdentity.email;
  }

  paymentDue() {
    // TODO: this is just a placeholder for now
    return null;
  }

  paymentDueV2() {
    // TODO: this is just a placeholder for now
    return this.moneyField(this.cart.cost.totalAmount);
  }

  webUrl() {
    return this.cart.checkoutUrl;
  }

  orderStatusUrl() {
    return null;
  }

  taxExempt() {
    return false; // TODO: investigate default value and posibble parity
  }

  taxesIncluded() {
    return false; // TODO: investigate default value and posibble parity
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

  shippingAddress() {
    if (!this.cart.buyerIdentity || !this.cart.buyerIdentity.deliveryAddressPreferences.length) {
      return null;
    }

    return this.cart.buyerIdentity.deliveryAddressPreferences[0];
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
