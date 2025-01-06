import {mapDiscountsAndLines} from './utilities/cart-mapping-utils';

// NOTE: fields such as availableShippingRates are not included because they are not queried by the JS Buy SDK
const UNSUPPORTED_FIELDS = {
  completedAt: null,
  order: null,
  orderStatusUrl: null,
  ready: false,
  requiresShipping: true,
  shippingLine: null,
  taxExempt: false,
  taxesIncluded: false
};

export function mapCartPayload(cart) {
  if (!cart) { return null; }

  const result = mapDiscountsAndLines(cart);
  const discountApplications = result.discountApplications;
  const cartLinesWithDiscounts = result.cartLinesWithDiscounts;

  const buyerIdentity = {
    countryCode: cart.buyerIdentity && cart.buyerIdentity.countryCode
  };

  let email = null;

  if (cart.buyerIdentity && cart.buyerIdentity.email) {
    email = cart.buyerIdentity.email;
  }

  let shippingAddress = null;

  if (cart.buyerIdentity &&
    cart.buyerIdentity.deliveryAddressPreferences &&
    cart.buyerIdentity.deliveryAddressPreferences.length) {
    shippingAddress = cart.buyerIdentity.deliveryAddressPreferences[0];
  }

  let currencyCode = null;
  let totalAmount = null;
  let totalTaxAmount = null;
  let totalDutyAmount = null;
  let checkoutChargeAmount = null;

  if (cart.cost) {
    if (cart.cost.totalAmount) {
      currencyCode = cart.cost.totalAmount.currencyCode;
      totalAmount = cart.cost.totalAmount;
    }
    if (cart.cost.totalTaxAmount) {
      totalTaxAmount = cart.cost.totalTaxAmount;
    }
    if (cart.cost.totalDutyAmount) {
      totalDutyAmount = cart.cost.totalDutyAmount;
    }
    if (cart.cost.checkoutChargeAmount) {
      checkoutChargeAmount = cart.cost.checkoutChargeAmount;
    }
  }

  const appliedGiftCards = cart.appliedGiftCards || [];
  let subtotalPrice = null;
  let paymentDue = null;

  if (totalAmount) {
    subtotalPrice = calculateSubtotalPrice(totalAmount, totalDutyAmount, totalTaxAmount);
    paymentDue = calculatePaymentDue(cart, totalAmount);
  }

  return Object.assign({
    appliedGiftCards,
    buyerIdentity,
    createdAt: cart.createdAt,
    currencyCode,
    customAttributes: cart.attributes,
    discountApplications,
    email,
    id: cart.id,
    lineItems: cartLinesWithDiscounts,
    lineItemsSubtotalPrice: checkoutChargeAmount,
    note: cart.note,
    paymentDue,
    paymentDueV2: paymentDue,
    shippingAddress,
    subtotalPrice,
    subtotalPriceV2: subtotalPrice,
    totalPrice: totalAmount,
    totalPriceV2: totalAmount,
    totalTax: totalTaxAmount || getDefaultMoneyObject(currencyCode, totalAmount),
    totalTaxV2: totalTaxAmount || getDefaultMoneyObject(currencyCode, totalAmount),
    updatedAt: cart.updatedAt,
    webUrl: cart.checkoutUrl
  }, UNSUPPORTED_FIELDS);
}


function getDefaultMoneyObject(currencyCode, totalAmount) {
  return {
    amount: 0,
    currencyCode,
    type: totalAmount && totalAmount.type
  };
}

function calculatePaymentDue(cart, totalAmount) {
  if (!cart.appliedGiftCards || !cart.appliedGiftCards.length) {
    return totalAmount;
  }

  // Assuming cart's totalAmount will have the same currency code as gift cards' presentmentAmountUsed
  let giftCardTotal = 0;

  for (let i = 0; i < cart.appliedGiftCards.length; i++) {
    giftCardTotal += cart.appliedGiftCards[i].presentmentAmountUsed.amount;
  }

  return {
    amount: totalAmount.amount - giftCardTotal,
    currencyCode: totalAmount.currencyCode,
    type: totalAmount.type
  };
}

function calculateSubtotalPrice(totalAmount, totalDutyAmount, totalTaxAmount) {
  const dutyAmount = totalDutyAmount ? totalDutyAmount.amount : 0;
  const taxAmount = totalTaxAmount ? totalTaxAmount.amount : 0;

  return {
    amount: totalAmount.amount - dutyAmount - taxAmount,
    currencyCode: totalAmount.currencyCode,
    type: totalAmount.type
  };
}
