
export default class PayloadMapper {
  constructor(graphQLClient) {
    this.graphQLClient = graphQLClient;
    this.cart = {};
    this.checkout = this.checkout.bind(this);
    this.id = this.id.bind(this);
    this.ready = this.ready.bind(this);
    this.note = this.note.bind(this);
    this.paymentDue = this.paymentDue.bind(this);
    this.paymentDueV2 = this.paymentDueV2.bind(this);
    this.webUrl = this.webUrl.bind(this);
    this.orderStatusUrl = this.orderStatusUrl.bind(this);
    this.taxExempt = this.taxExempt.bind(this);
    this.taxesIncluded = this.taxesIncluded.bind(this);
    this.currencyCode = this.currencyCode.bind(this);
    this.lineItems = this.lineItems.bind(this);
    this.fetch = this.fetch.bind(this);

  }

  checkout(cart) {
    this.cart = cart;

    return {
      id: this.id(),
      // ready: this.ready(),
      // note: this.note(),
      // paymentDue: this.paymentDue(),
      // paymentDueV2: this.paymentDueV2(),
      webUrl: this.webUrl()
      // orderStatusUrl: this.orderStatusUrl(),
      // taxExempt: this.taxExempt(),
      // taxesIncluded: this.taxesIncluded(),
      // currencyCode: this.currencyCode()
    };
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

  paymentDue() {
    return this.moneyField(this.cart.paymentDue);
  }

  paymentDueV2() {
    return this.moneyField(this.cart.paymentDueV2);
  }

  webUrl() {
    return this.cart.checkoutUrl;
  }

  orderStatusUrl() {
    return null;
  }

  taxExempt() {
    return false; // TODO: implement
  }

  taxesIncluded() {
    return false; // TODO: implement
  }

  currencyCode() {
    return this.cart.cost.totalAmount.currencyCode;
  }

  lineItems(lines) {
    return lines; // TODO: implement
  }

  fetch(cart) {
    if (!cart) {
      return null;
    }

    this.cart = cart;

    // convert cart to checkout
    const checkout = this.checkout(cart);

    return this.graphQLClient.fetchAllPages(cart.lines, {pageSize: 250}).then((lines) => {
      checkout.lineItems = this.lineItems(lines);

      return checkout;
    });
  }

  // utilities
  moneyField(field) {
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
