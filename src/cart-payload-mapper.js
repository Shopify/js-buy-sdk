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

    // TODO: map type property
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
  // TODO: should we return null instead?
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
    if (!this.cart.appliedGiftCards.length) {
      return this.cart.cost.totalAmount;
    }

    // Assuming cart's totalAmount will have the same currency code as gift cards' presentmentAmountUsed
    // TODO - verify this assumption
    return {
      amount: this.cart.cost.totalAmount.amount - this.cart.appliedGiftCards.reduce((acc, giftCard) => acc + giftCard.presentmentAmountUsed.amount, 0),
      currencyCode: this.cart.cost.totalAmount.currencyCode,
      type: this.cart.cost.totalAmount.type
    };
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
    return this.cart.cost.totalAmount;
  }

  totalTax() {
    // Field is nullable on Cart object but non-nullable on Checkout object
    if (!this.cart.cost.totalTaxAmount) {
      // TODO - do we just want to return null here instead, even though it's non-nullable on the Checkout object?
      return {
        amount: 0,
        currencyCode: this.cart.cost.totalAmount.currencyCode,
        type: this.cart.cost.totalAmount.type
      };
    }

    return this.cart.cost.totalTaxAmount;
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

    return lines.map((line) => {
      // The actual Cart merchandise and Checkout variant objects map cleanly to each other,
      // but the SDK wasn't fetching the title from the product object, so we need to remove it
      const productWithoutTitle = Object.fromEntries(
        Object.entries(line.merchandise.product)
          .filter(([key]) => key !== 'title')
      );

      // `priceV2` and `compareAtPriceV2` still exist in the Cart API but are deprecated,
      // so assigning them to `price` and `compareAtPrice` is more future-proof than asking for
      // them in the GraphQL payload
      const variant = Object.assign(
        {},
        Object.fromEntries(
          Object.entries(line.merchandise)
            .filter(([key]) => key !== 'product')
        ),
        {
          priceV2: line.merchandise.price,
          compareAtPriceV2: line.merchandise.compareAtPrice,
          product: productWithoutTitle,
          type: {
            name: "ProductVariant",
            kind: "OBJECT",
            fieldBaseTypes: {
              availableForSale: "Boolean",
              compareAtPrice: "MoneyV2",
              id: "ID",
              image: "Image",
              price: "MoneyV2",
              product: "Product",
              selectedOptions: "SelectedOption",
              sku: "String",
              title: "String",
              unitPrice: "MoneyV2",
              unitPriceMeasurement: "UnitPriceMeasurement",
              weight: "Float"
            },
            implementsNode: true
          }
        }
      );

      return {
        customAttributes: line.attributes,
        discountAllocations: line.discountAllocations.map((discountAllocation) => ({
          allocatedAmount: discountAllocation.discountedAmount,
          discountApplication: {
            targetType: discountAllocation.targetType,
            value: discountAllocation.value,
            allocationMethod: discountAllocation.allocationMethod,
            targetSelection: discountAllocation.targetSelection,
          },
        })),
        id: line.id,
        quantity: line.quantity,
        title: line.merchandise.product.title,
        variant,
        hasNextPage: line.hasNextPage,
        hasPreviousPage: line.hasPreviousPage,
        variableValues: line.variableValues,
        type: {
          name: "CheckoutLineItem",
          kind: "OBJECT",
          fieldBaseTypes: {
            customAttributes: "Attribute",
            discountAllocations: "Object[]",
            id: "ID",
            quantity: "Int",
            title: "String",
            variant: "Merchandise"
          },
          implementsNode: true
        }
      };
    });
  }

  lineItemsSubtotalPrice() {
    return this.cart.cost.checkoutChargeAmount;
  }

  customAttributes() {
    return this.cart.attributes;
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
        // TODO: map type property
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
    return {
      amount: this.cart.cost.totalAmount.amount -
        (this.cart.cost.totalDutyAmount ? this.cart.cost.totalDutyAmount.amount : 0) -
        (this.cart.cost.totalTaxAmount ? this.cart.cost.totalTaxAmount.amount : 0),
      currencyCode: this.cart.cost.totalAmount.currencyCode,
      type: this.cart.cost.totalAmount.type
    };
  }
}
