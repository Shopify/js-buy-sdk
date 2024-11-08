
export default class PayloadMapper {
  constructor(graphQLClient) {
    this.graphQLClient = graphQLClient;
    this.cart = {};

    // methods
    this.checkout = this.checkout.bind(this);
    this.fetch = this.fetch.bind(this);

    // fields
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
    return this.moneyField(this.cart.cost.totalAmount);
  }

  paymentDueV2() {
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

  fetch(cart) {
    if (!cart) {
      return null;
    }

    this.cart = cart;

    console.log('cart', cart);

    // convert cart to checkout
    const checkout = this.checkout(cart);

    // return this.graphQLClient.fetchAllPages(cart.lines, {pageSize: 250}).then((lines) => {
    //   checkout.lineItems = this.lineItems(lines);
    //
    //   return checkout;
    // });
    console.log('checkout', checkout);

    return checkout;
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

/**
{
  "id": "gid://shopify/Checkout/243f4b20068ba08aa972fd67a027478c?key=ed04a7ca380e203b702f723629a91dcf",
  "ready": false,
  "requiresShipping": false,
  "note": null,
  "paymentDue": {
    "amount": "0.0",
    "currencyCode": "USD",
    "type": {
      "name": "MoneyV2",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "amount": "Decimal",
        "currencyCode": "CurrencyCode"
      },
      "implementsNode": false
    }
  },
  "paymentDueV2": {
    "amount": "0.0",
    "currencyCode": "USD",
    "type": {
      "name": "MoneyV2",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "amount": "Decimal",
        "currencyCode": "CurrencyCode"
      },
      "implementsNode": false
    }
  },
  "webUrl": "https://juanprieto.myshopify.com/60187836438/checkouts/243f4b20068ba08aa972fd67a027478c?key=ed04a7ca380e203b702f723629a91dcf",
  "orderStatusUrl": null,
  "taxExempt": false,
  "taxesIncluded": false,
  "currencyCode": "USD",
  "totalTax": {
    "amount": "0.0",
    "currencyCode": "USD",
    "type": {
      "name": "MoneyV2",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "amount": "Decimal",
        "currencyCode": "CurrencyCode"
      },
      "implementsNode": false
    }
  },
  "totalTaxV2": {
    "amount": "0.0",
    "currencyCode": "USD",
    "type": {
      "name": "MoneyV2",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "amount": "Decimal",
        "currencyCode": "CurrencyCode"
      },
      "implementsNode": false
    }
  },
  "lineItemsSubtotalPrice": {
    "amount": "0.0",
    "currencyCode": "USD",
    "type": {
      "name": "MoneyV2",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "amount": "Decimal",
        "currencyCode": "CurrencyCode"
      },
      "implementsNode": false
    }
  },
  "subtotalPrice": {
    "amount": "0.0",
    "currencyCode": "USD",
    "type": {
      "name": "MoneyV2",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "amount": "Decimal",
        "currencyCode": "CurrencyCode"
      },
      "implementsNode": false
    }
  },
  "subtotalPriceV2": {
    "amount": "0.0",
    "currencyCode": "USD",
    "type": {
      "name": "MoneyV2",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "amount": "Decimal",
        "currencyCode": "CurrencyCode"
      },
      "implementsNode": false
    }
  },
  "totalPrice": {
    "amount": "0.0",
    "currencyCode": "USD",
    "type": {
      "name": "MoneyV2",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "amount": "Decimal",
        "currencyCode": "CurrencyCode"
      },
      "implementsNode": false
    }
  },
  "totalPriceV2": {
    "amount": "0.0",
    "currencyCode": "USD",
    "type": {
      "name": "MoneyV2",
      "kind": "OBJECT",
      "fieldBaseTypes": {
        "amount": "Decimal",
        "currencyCode": "CurrencyCode"
      },
      "implementsNode": false
    }
  },
  "completedAt": null,
  "createdAt": "2024-10-29T15:43:28Z",
  "updatedAt": "2024-10-29T15:43:28Z",
  "email": null,
  "discountApplications": [],
  "appliedGiftCards": [],
  "shippingAddress": null,
  "shippingLine": null,
  "customAttributes": [],
  "order": null,
  "lineItems": [],
  "type": {
    "name": "Checkout",
    "kind": "OBJECT",
    "fieldBaseTypes": {
      "appliedGiftCards": "AppliedGiftCard",
      "completedAt": "DateTime",
      "createdAt": "DateTime",
      "currencyCode": "CurrencyCode",
      "customAttributes": "Attribute",
      "discountApplications": "DiscountApplicationConnection",
      "email": "String",
      "id": "ID",
      "lineItems": "CheckoutLineItemConnection",
      "lineItemsSubtotalPrice": "MoneyV2",
      "note": "String",
      "order": "Order",
      "orderStatusUrl": "URL",
      "paymentDue": "MoneyV2",
      "ready": "Boolean",
      "requiresShipping": "Boolean",
      "shippingAddress": "MailingAddress",
      "shippingLine": "ShippingRate",
      "subtotalPrice": "MoneyV2",
      "taxExempt": "Boolean",
      "taxesIncluded": "Boolean",
      "totalPrice": "MoneyV2",
      "totalTax": "MoneyV2",
      "updatedAt": "DateTime",
      "webUrl": "URL"
    },
    "implementsNode": true
  },
  "userErrors": []
}
**/
